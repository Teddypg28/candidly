import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"

import db from '../db.server'

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.public.appProxy(request)
        const productId = parseInt(params.productId as string)
        // fetch all questions connected to the store
        const allQuestions = await db.reviewFormQuestion.findMany({where: {store: {equals: session?.shop}}, include: {radioAnswerChoices: true}})
        // only return questions that are configured for all products or for the given product ID
        const configuredQuestions = allQuestions.filter(question => {
            if (question.productConfiguration[0] === 'all' || question.productIds.includes(`gid://shopify/Product/${productId}`)) {
                return question
            }
        })
        return new Response(JSON.stringify({result: configuredQuestions}), {status: 200})
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500})
    }
}