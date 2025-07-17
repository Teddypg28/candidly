import { AdminApiContextWithRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients"

export const createEachProductReviewRequest = async (request: any, admin: AdminApiContextWithRest) => {

    const query = `
    {
      order(id: "gid://shopify/Order/${request.orderId}") {
        lineItems(first: 100, reverse: true) {
          edges {
            node {
              currentQuantity
              product {
                title
              }  
            }
          }
        }
      }
    }`

    const res = await admin.graphql(query)
    const data = await res.json()

    const stillInOrderTitles = data.data.order.lineItems.edges.filter((edge: any) => {
        if (edge.node.currentQuantity > 0) {
            return edge
        }
    }).map((item: any) => {
        return item.node.product.title
    })

    const reviewRequests = stillInOrderTitles.filter((title: any, index: number) => {
        return stillInOrderTitles.indexOf(title) === index
    }).map((itemName: string) => {
        return {
            ...request,
            orderId: parseInt(request.orderId.toString()),
            product: itemName
        }
    })
    return reviewRequests
}