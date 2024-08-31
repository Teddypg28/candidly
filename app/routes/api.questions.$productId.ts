import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"

import db from '../db.server'

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

    try {

        let productId

        if (params.productId) {
            productId = parseInt(params.productId)
        }
    
        const { session } = await authenticate.public.appProxy(request)
    
        const result = await db.reviewFormQuestion.findMany({include: {answerChoices: true}, omit: {productId: true, store: true}, where: {store: {equals: session?.shop}, productId: {equals: productId}}})
        
        return new Response(JSON.stringify({result}), {status: 200})
        
    } catch (error) {

        return new Response(JSON.stringify({error}), {status: 500})
        
    }

}