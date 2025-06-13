import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"

import db from '../db.server'

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {
        const { session, admin } = await authenticate.public.appProxy(request)
        const productId = parseInt(params.productId as string)

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
        const res = await admin?.graphql(matchingCollectionIdsQuery)
        const data = await res?.json()
        const matchingCollectionIds = data?.data.product.collections.edges.map((edge: any) => edge.node.id)

        // fetch all questions connected to the store
        const allQuestions = await db.reviewFormQuestion.findMany({where: {store: {equals: session?.shop}}, include: {radioAnswerChoices: true}})
        // only return questions that are configured for all products or for the given product ID
        const configuredQuestions = allQuestions.filter(question => {
            if (question.productConfiguration[0] === 'all' || question.productConfiguration[0] === 'products' && question.productIds.includes(`gid://shopify/Product/${productId}`)
            || question.productConfiguration[0] === 'collections' && question.collectionIds.some(cId => matchingCollectionIds.includes(cId))
            ) {
                return question
            }
        })
        return new Response(JSON.stringify({result: configuredQuestions}), {status: 200})
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({error}), {status: 500})
    }
}