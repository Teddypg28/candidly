import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import generateReviewRequestHash from "~/auth/generateReviewRequestHash.server";
import fetchSubscriptionData from "~/helpers/fetchSubscriptionData";
import { Session } from "@prisma/client";

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
        const subscription = await db.subscription.findFirst({where: {subscriptionId: {equals: payload.app_subscription.admin_graphql_api_id}}})
        if (subscriptionDetails && subscription) {

          const type = subscriptionDetails.price === 9.99 ? "basic" : subscriptionDetails.price === 19.99 ? "pro" : "advanced"
          const emailsSent = new Date().toLocaleDateString() === subscription.renewalDate ? 0 : subscription.emailsSent 
          
          let emailQuota
          if (subscription.type === type) {
            switch (type) {
              case "basic":
                emailQuota = 1000
                break;
              case "pro":
                emailQuota = 5000
                break;
              case "advanced":
                emailQuota = 10000
                break;
            }
          } else {
            let direction: "upgrade" | "downgrade" = "downgrade"
            if (subscription.type === "free" || subscription.type === "basic" || subscription.type === "pro" && type !== "basic") {
              direction = "upgrade"
            }

            const renewalDate = new Date(subscription.renewalDate)
            renewalDate.setUTCHours(0, 0, 0, 0)
            const isoStringRenewalDate = renewalDate.toISOString()

            const currentDate = new Date()
            currentDate.setUTCHours(0, 0, 0, 0)
            const isoStringCurrentDate = currentDate.toISOString()

            const daysLeftInCycle = Math.floor((new Date(isoStringRenewalDate).getTime() - new Date(isoStringCurrentDate).getTime()) / (1000 * 60 * 60 * 24))
            const daysUsed = 30 - daysLeftInCycle
            const daysRemaining = 30 - daysUsed

            const paidQuotaSoFar = subscription.emailQuota

            if (direction === "upgrade") {
              // upgrade logic
              const newEmailQuota = type === "basic" ? 1000 : type === "pro" ? 5000 : 10000
              emailQuota = paidQuotaSoFar + ((newEmailQuota - paidQuotaSoFar) * (daysRemaining/30))
            } else {
              // downgrade logic
              const newEmailQuota = type === "basic" ? 1000 : 5000
              emailQuota = (newEmailQuota * (daysRemaining/30)) + ((paidQuotaSoFar * (daysUsed/30)))
            }
          }
          await db.subscription.update({where: {id: subscription.id}, data: { type, renewalDate: new Date(subscriptionDetails.endsAt).toLocaleDateString(), emailsSent, emailQuota }})
        }
      }
      break;
    
    case "ORDERS_CANCELLED":

      if (session) {
        await db.reviewRequest.deleteMany({where: {store: {equals: session.shop}, AND: {orderId: {equals: payload.id}}}}) 
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
