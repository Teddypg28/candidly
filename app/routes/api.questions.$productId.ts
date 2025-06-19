import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"

import fetchConfiguredQuestions from "~/helpers/questions/fetchConfiguredQuestions"

export const loader = async ({ request, params } : LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.public.appProxy(request)

        if (session && session.accessToken) {
            const productId = parseInt(params.productId as string)
    
            const configuredQuestions = await fetchConfiguredQuestions(productId, session.shop, session.accessToken)
    
            return new Response(JSON.stringify({result: configuredQuestions}), {status: 200})
        }
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({error}), {status: 500})
    }
}