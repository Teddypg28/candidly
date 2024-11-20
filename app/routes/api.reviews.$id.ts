import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

export async function loader({request, params} : LoaderFunctionArgs) {

    const { session } = await authenticate.public.appProxy(request)

    if (session && params.id) {
        
        try {
            
            const reviews = await db.productReview.findMany({where: { store: {equals: session.shop}, productId: {equals: `gid://shopify/Product/${params.id}`}, isPublished: {equals: true}}, include: {customQuestionAnswers: true}, omit: {productId: true}})

            if (reviews) {

                return new Response(JSON.stringify({reviews}), {status: 200})

            } else {

                return new Response('[]', {status: 200})

            }

        } catch (error) {

            console.log(error)

            return new Response(JSON.stringify(error), {status: 500})
            
        }

    }

}