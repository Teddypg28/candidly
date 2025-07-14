import { AdminApiContext } from '@shopify/shopify-app-remix/server'
import db from '../../db.server'

const fetchConfiguredQuestions = async (productId: number, store: string, accessToken: string) => {

    const matchingCollectionIdsQuery = `
    query {
        product(id: "gid://shopify/Product/${productId}") {
          id
          title
          collections(first: 250) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    `
    const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
      method: 'POST', 
      headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({query: matchingCollectionIdsQuery})
  })

  const data = await res?.json()
    const productCollectionIds = data?.data.product.collections.edges.map((edge: any) => edge.node.id)

    // fetch all questions connected to the store
    const allQuestions = await db.reviewFormQuestion.findMany({where: {store: {equals: store}}, include: {radioAnswerChoices: true}})
    // only return questions that are configured for all products or for the given product ID
    const configuredQuestions = allQuestions.filter(question => {
        if (question.productConfiguration[0] === 'all' || question.productConfiguration[0] === 'products' && question.productIds.includes(`gid://shopify/Product/${productId}`)
        || question.productConfiguration[0] === 'collections' && question.collectionIds.some(cId => productCollectionIds.includes(cId))
        ) return question
    })
    return configuredQuestions
}

export default fetchConfiguredQuestions
