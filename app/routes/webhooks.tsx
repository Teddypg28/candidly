import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

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
            fulfillmentStatus: payload.fulfillment_status
          }
  
          await db.reviewRequest.create({ data })
            
        }

      break
    
    case "ORDERS_FULFILLED":

      if (session) {

        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})
  
        if (storeSettings) {
  
          const daysAfterFulfillment = storeSettings.firstReviewRequest
          const nextRequestDate = new Date(payload.created_at)
          nextRequestDate.setDate(nextRequestDate.getDate() + daysAfterFulfillment)

          await db.reviewRequest.updateMany({where: {orderId: payload.id}, data: {fulfillmentStatus: payload.fulfillment_status, nextRequestDate}})
  
        }

      }

      break
    
    case "ORDERS_CANCELLED":

      if (session) {

        await db.reviewRequest.deleteMany({where: {store: {equals: session.shop}, AND: {orderId: {equals: payload.id}}}}) 

      }

      break
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
