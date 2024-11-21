import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"

import db from '../db.server'

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    try {

        let productId: any

        if (params.productId) {
            productId = parseInt(params.productId)
        }
    
        const { session } = await authenticate.public.appProxy(request)
    
        const questions = await db.reviewFormQuestion.findMany({where: {store: {equals: session?.shop}}, include: {radioAnswerChoices: true}})

        const eligibleQuestions: any = []
        questions.forEach(question => {
            if (question.productConfiguration[0] === 'all' || question.productIds.includes(`gid://shopify/Product/${productId}`)) {
                eligibleQuestions.push(question)
            }
        })
        
        return new Response(JSON.stringify({result: eligibleQuestions}), {status: 200})
        
    } catch (error) {

        return new Response(JSON.stringify({error}), {status: 500})
        
    }

}