import db from '../../db.server'

export default async function fetchProductTitle(store: string, id: string) {

    const session = await db.session.findFirst({where: {shop: {equals: store}}})

    if (session?.accessToken) {
        const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
              method: 'POST', 
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': session.accessToken,
              },
              body: JSON.stringify({query: `
              query GetProduct($id: ID!) {
                product(id: $id) {
                  title
                }
              }`, variables: {id}})
          })
        const productData = await res.json()
        return productData.data.product.title || "Product Deleted"
    } 

    return null

}