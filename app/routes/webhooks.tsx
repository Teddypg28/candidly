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

        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})

        if (storeSettings) {

          const daysAfterOrder = storeSettings.firstEmail

          const requestDate = new Date(payload.created_at)
          requestDate.setDate(requestDate.getDate() + daysAfterOrder)
  
          await Promise.all(payload.line_items.map(async (lineItem: any) => {
            
            const data = {
              store: session.shop,
              orderId: payload.id,
              lineItemId: lineItem.id,
              productId: lineItem.product_id,
              variantId: lineItem.variant_id,
              requestDate,
              requestNumber: 1
            }

            return await db.reviewRequest.create({ data })

          }))

        }

      }

      break

    case "ORDERS_EDITED":

      if (session) {

        const removals = payload.order_edit.line_items.removals
        const additions = payload.order_edit.line_items.additions
  
        if (removals.length > 0) {
  
          await Promise.all(removals.map(async (removal: any) => {
  
            const result = await db.reviewRequest.findFirst({where: {store: {equals: session.shop}, AND: {lineItemId: {equals: removal.id}}}})
  
            if (result) {

              return await db.reviewRequest.delete({where: {id: result.id}})

            }

            return false
  
          }))
  
        }

        if (additions.length > 0) {

          const query = `
            query {
              order: order(id: "gid://shopify/Order/${payload.order_edit.order_id}") {
                createdAt
                lineItems(first: 25, reverse: true) {
                  edges {
                    node {
                      id
                      product {
                        id
                      }
                      variant {
                        id
                      }
                    }
                  }
                }
              }
            }
          `

          const storeSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})

          await Promise.all(additions.map(async (lineItem: any) => {

            const response = await admin.graphql(query)
            const data = await response.json()

            const lineItems = data.data.order.lineItems.edges

            for (let i = 0; i<lineItems.length; i++) {

              if (lineItems[i].node.id === `gid://shopify/LineItem/${lineItem.id}`) {

                if (storeSettings) {

                    const daysAfterOrder = storeSettings.firstEmail
  
                    const requestDate = new Date(data.data.order.createdAt)
                    requestDate.setDate(requestDate.getDate() + daysAfterOrder)
    
                    const reviewRequestData = {
    
                      store: session.shop,
                      orderId: payload.order_edit.order_id,
                      lineItemId: lineItem.id,
                      productId: parseInt(lineItems[i].node.product.id.split('Product/')[1]),
                      variantId: parseInt(lineItems[i].node.variant.id.split('ProductVariant/')[1]),
                      requestDate,
                      requestNumber: 1
    
                    }
    
                    return await db.reviewRequest.create({ data: reviewRequestData })
                    
                  }
                }
            }
            
          }))

        }

      }

      console.log('WORKED')

      break
    
    case "ORDERS_CANCELLED":

      if (session) {

        await db.reviewRequest.deleteMany({where: {store: {equals: session?.shop}, AND: {orderId: {equals: payload.id}}}}) 

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
