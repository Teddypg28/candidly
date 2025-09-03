import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import generateReviewRequestHash from "~/auth/generateReviewRequestHash.server";
import fetchSubscriptionData from "~/helpers/fetchSubscriptionData";
import { Session, Subscription } from "@prisma/client";

import { getCurrentDate } from "~/helpers/getCurrentDate";

import { basic, pro, advanced } from "~/emailQuotaVariables";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

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
          const data = {
            createdAt: new Date(payload.created_at),
            orderName: payload.name,
            orderId: payload.id,
            store: session.shop,
            email: payload.customer.email,
            firstName: payload.customer.first_name,
            fulfillmentStatus: payload.fulfillment_status,
            authToken: await generateReviewRequestHash()
          }
          await db.reviewRequest.create({ data })
        }

      break;
    
    case "ORDERS_FULFILLED":

      if (session) {
        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
  
        if (storeSettings) {
          const daysAfterFulfillment = storeSettings.firstReviewRequest
          const nextRequestDate = new Date(payload.created_at)
          nextRequestDate.setDate(nextRequestDate.getDate() + daysAfterFulfillment)

          await db.reviewRequest.updateMany({where: {orderId: payload.id}, data: {fulfillmentStatus: payload.fulfillment_status, nextRequestDate: nextRequestDate.toLocaleDateString()}})
        }
      }

      break;
    case "APP_SUBSCRIPTIONS_UPDATE":
      if (payload.app_subscription.status === "ACTIVE") {
        const storeSession = await db.session.findFirst({where: {shop: {equals: session?.shop}}}) as Session
        const subscriptionDetails = await fetchSubscriptionData(payload.app_subscription.admin_graphql_api_id, storeSession.shop, storeSession.accessToken)
        const subscription = await db.subscription.findFirst({where: {shop: {equals: session?.shop}}}) as Subscription
        
        if (subscriptionDetails && subscription) {

          const type = subscriptionDetails.price === 9.99 ? "basic" : subscriptionDetails.price === 19.99 ? "pro" : "advanced"
          const emailsSent = new Date().toLocaleDateString() === subscription.renewalDate.toLocaleDateString() ? 0 : subscription.emailsSent 

          const currentDate = getCurrentDate()
          currentDate.setUTCHours(0, 0, 0, 0)

          const renewalDate = new Date(subscription.renewalDate)
          renewalDate.setUTCHours(0, 0, 0, 0)
          
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
          } else {
            let direction: "upgrade" | "downgrade" = "downgrade"
            if (subscription.type === "free" || subscription.type === "basic" || subscription.type === "pro" && type !== "basic") {
              direction = "upgrade"
            }

            const isoStringRenewalDate = renewalDate.toISOString()
            const isoStringCurrentDate = currentDate.toISOString()

            const planStarted = new Date(subscription.planStarted)
            planStarted.setUTCHours(0, 0, 0, 0)
            const isoStringPlanStartedDate = planStarted.toISOString()

            const daysRemaining = Math.floor((new Date(isoStringRenewalDate).getTime() - new Date(isoStringCurrentDate).getTime()) / (1000 * 60 * 60 * 24))
            const daysUsed = Math.floor((new Date(isoStringCurrentDate).getTime() - new Date(isoStringPlanStartedDate).getTime()) / (1000 * 60 * 60 * 24))

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
            planStarted: getCurrentDate(),
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
      throw new Response("Unhandled webhook topic", { status: 200 });
    case "CUSTOMERS_REDACT":
      throw new Response("Unhandled webhook topic", { status: 200 });
    case "SHOP_REDACT":
      throw new Response("Unhandled webhook topic", { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
