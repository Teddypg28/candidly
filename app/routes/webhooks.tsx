import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import generateReviewRequestHash from "~/auth/generateReviewRequestHash.server";
import fetchSubscriptionData from "~/helpers/fetchSubscriptionData";
import { Session, Subscription } from "@prisma/client";
import fs from 'fs/promises';
import nodemailer from 'nodemailer'

import { basic, pro, advanced } from "~/helpers/subscriptionData/emailQuotaVariables";
import { DateTime } from "luxon";
import { basicTierPrice, proTierPrice } from "~/helpers/subscriptionData/tierPrices";
import deleteS3Upload from "~/utils/deleteS3Upload";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  const subscription = await db.subscription.findFirst({where: { shop }}) as Subscription

  if (!admin && topic !== 'SHOP_REDACT') {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    // The SHOP_REDACT webhook will be fired up to 48 hours after a shop uninstalls the app.
    // Because of this, no admin context is available.
    throw new Response();
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "ORDERS_CREATE":
      if (session) {

          const createdAt = new Date(payload.created_at)

          const data = {
            createdAt,
            orderName: payload.name,
            orderId: payload.id,
            store: session.shop,
            email: payload.customer.email,
            firstName: payload.customer.first_name,
            fulfillmentStatus: payload.fulfillment_status,
            authToken: await generateReviewRequestHash(),
            timezone: subscription.timezone as string
          }
          await db.reviewRequest.create({ data })
        }

      break;
    
    case "ORDERS_FULFILLED":

      if (session) {
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
  
        if (appSettings) {
          const daysAfterFulfillment = appSettings.firstReviewRequest
          const currentDate = DateTime.now().setZone(subscription.timezone as string).set({hour: 10, minute: 0, second: 0, millisecond: 0})
          const nextRequestDate = currentDate.plus({days: daysAfterFulfillment}).toUTC()

          await db.reviewRequest.updateMany({where: {orderId: payload.id}, data: {fulfillmentStatus: payload.fulfillment_status, nextRequestDate: nextRequestDate.toJSDate()}})
        }
      }

      break;
    case "APP_SUBSCRIPTIONS_UPDATE":
      if (payload.app_subscription.status === "ACTIVE") {

        const storeSession = await db.session.findFirst({where: {shop: {equals: session?.shop}}}) as Session
        const subscriptionDetails = await fetchSubscriptionData(payload.app_subscription.admin_graphql_api_id, storeSession.shop, storeSession.accessToken)
        const subscription = await db.subscription.findFirst({where: {shop: {equals: session?.shop}}}) as Subscription
        
        if (subscriptionDetails && subscription) {

          const type = subscriptionDetails.price === basicTierPrice ? "basic" : subscriptionDetails.price === proTierPrice ? "pro" : "advanced"

          // same current subscription type as subscription type of new subscription payload means there is a renewal (reset emails sent)
          const emailsSent = subscription.type === type ? 0 : subscription.emailsSent 

          const currentDate = new Date()
          let renewalDate = new Date(subscription.renewalDate)
          let planStarted = new Date(subscription.planStarted)
          
          let emailQuota

          if (subscription.type === type) {
            switch (type) {
              case "basic":
                emailQuota = basic
                break;
              case "pro":
                emailQuota = pro
                break;
              case "advanced":
                emailQuota = advanced
                break;
            }

            // same current subscription type as subscription type of new subscription payload means there is a renewal (update billing cycle dates)
            renewalDate.setDate(renewalDate.getDate() + 30)
            planStarted.setDate(planStarted.getDate() + 30)
          } else {
            const tierOrder = { free: 0, basic: 1, pro: 2, advanced: 3 }
            const direction = tierOrder[type] > tierOrder[subscription.type as keyof typeof tierOrder] ? "upgrade" : "downgrade"

            const daysRemaining = Math.max(0, Math.round((subscription.renewalDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))
            const daysUsed = Math.max(0, Math.round((currentDate.getTime() - planStarted.getTime()) / (1000 * 60 * 60 * 24)))

            const paidQuotaSoFar = subscription.emailQuota

            if (direction === "upgrade") {
              // upgrade logic
              const newEmailQuota = type === "basic" ? basic : type === "pro" ? pro : advanced
              emailQuota = paidQuotaSoFar + ((newEmailQuota - paidQuotaSoFar) * (daysRemaining/30))
            } else {
              // downgrade logic
              const newEmailQuota = type === "basic" ? basic : pro
              emailQuota = (newEmailQuota * (daysRemaining/30)) + ((paidQuotaSoFar * (daysUsed/30)))
            }
          }
          await db.subscription.update({where: {id: subscription.id}, data: { 
            type, 
            renewalDate, 
            emailsSent, 
            emailQuota, 
            planStarted,
            subscriptionId: payload.app_subscription.admin_graphql_api_id
          }})
        }
      }
      break;
    
    case "ORDERS_CANCELLED":

      if (session) {
        await db.reviewRequest.deleteMany({where: {store: {equals: session.shop}, AND: {orderId: {equals: payload.id}}}}) 
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":

      const appSettings = await db.appSettings.findFirst({where: {store: {equals: shop}}})

      if (!appSettings) throw new Response("store email could not be fetched", { status: 400 });

      const dataRequestCustomerEmail = payload.customer.email
      const dataRequestCustomerId = payload.customer.id

      const reviews = await db.productReview.findMany({
        where: {
          email: dataRequestCustomerEmail
        }
      });

      const questions = await db.customerQuestion.findMany({ 
        where: { store: {equals: shop}, AND: {email: {equals: dataRequestCustomerEmail}}  
      }})

      const exportData = {
        customer: {
          email: dataRequestCustomerEmail,
          firstName: reviews[0]?.firstName || null
        },
        reviews: reviews.map(review => ({
          productId: review.productId,
          review: review.body,
          rating: review.rating,
          submittedAt: review.date.toISOString()
        })),
        questions: questions.map(question => ({
          questonId: question.id,
          question: question.title,
          createdAt: question.createdAt
        }))
      };

      const filePath = `/tmp/customer-data-${dataRequestCustomerId}.json`;

      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

      const transporter = nodemailer.createTransport({
        host: 'email-smtp.us-east-2.amazonaws.com',
        port: 587, 
        secure: false,
        auth: {
          user: `${process.env.SES_SMTP_USERNAME}`,
          pass: `${process.env.SES_SMTP_PASSWORD}`
        }
      });

      await transporter.sendMail({
        from: 'privacy@trycandidly.app',
        to: appSettings.primaryEmail,
        subject: `Customer Data Request – ${exportData.customer.email}`,
        text: `Attached is the requested customer data`,
        attachments: [
          {
            filename: 'customer-data.json',
            path: filePath
          }
        ]
      });

      await fs.unlink(filePath);

      throw new Response("Customer data successfully emailed to the store owner", { status: 200 });
    case "CUSTOMERS_REDACT":
      const customerEmail: string = payload.customer.email

      await db.customerQuestion.deleteMany({ where: { store: {equals: shop}, AND: {email: {equals: customerEmail}}  } })
   
      const userProductReviews = await db.productReview.findMany({ where: { email: {equals: customerEmail} }, include: {media: true} })
      await Promise.allSettled(userProductReviews.map(async (productReview) => {
        await Promise.allSettled(productReview.media.map(deleteS3Upload))
        await db.productReview.delete({where: {id: productReview.id}})
      }))

      throw new Response("customer data successfully deleted", { status: 200 });
    case "SHOP_REDACT":
       await db.$transaction([
        db.appSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.currentOrdersStatus.deleteMany({ where: { store: {equals: shop} } }),
        db.customerQuestion.deleteMany({ where: { store: {equals: shop} } }),
        db.customerQuestionAnswer.deleteMany({ where: { store: {equals: shop} } }),
        db.customerQuestionEmailSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.customerRewardEmailSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.onboardingDismissalState.deleteMany({ where: { store: {equals: shop} } }),
        db.reviewRequestEmailSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.pendingReward.deleteMany({ where: { store: {equals: shop} } }),
        db.reviewFormQuestion.deleteMany({ where: { store: {equals: shop} } }),
        db.reviewFormSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.reviewRequest.deleteMany({ where: { store: {equals: shop} } }),
        db.reward.deleteMany({ where: { store: {equals: shop} } }),
        db.rewardSettings.deleteMany({ where: { store: {equals: shop} } }),
        db.savedCustomQuestionTableView.deleteMany({ where: { store: {equals: shop} } }),
        db.savedQuestionAnswerTableView.deleteMany({ where: { store: {equals: shop} } }),
        db.savedReviewRequestTableView.deleteMany({ where: { store: {equals: shop} } }),
        db.savedReviewsTableViews.deleteMany({ where: { store: {equals: shop} } }),
        db.subscription.deleteMany({ where: { shop } })
      ]);

      const emailDesignSettings = await db.emailDesignSettings.findFirst({ where: { store: {equals: shop} }, include: {logo: true} })
      if (emailDesignSettings) {
        if (emailDesignSettings.logo) await deleteS3Upload(emailDesignSettings.logo)
        await db.emailDesignSettings.delete({where: {id: emailDesignSettings.id}})
      }

      const productReviews = await db.productReview.findMany({ where: { store: {equals: shop} }, include: {media: true} })
      await Promise.allSettled(productReviews.map(async (productReview) => {
        await Promise.allSettled(productReview.media.map(deleteS3Upload))
        await db.productReview.delete({where: {id: productReview.id}})
      }))

      throw new Response("shop data successfully deleted", { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
