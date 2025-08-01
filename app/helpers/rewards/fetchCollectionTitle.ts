import db from '../../db.server'

export default async function fetchCollectionTitle(store: string, id: string) {

    const session = await db.session.findFirst({where: {shop: {equals: store}}})

    if (session?.accessToken) {
        const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
              method: 'POST', 
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': session.accessToken,
              },
              body: JSON.stringify({query: `
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  title
                }
              }`, variables: {id}})
          })
        const collectionData = await res.json()
        if (collectionData.data.collection) {
          return collectionData.data.collection.title
        } else {
          return null
        }
    } 

    return null

}