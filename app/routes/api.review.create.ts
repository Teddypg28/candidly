import { ActionFunctionArgs, json } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'

import verifyReview from "~/helpers/verifyReview"
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields"

export async function action({ request } : ActionFunctionArgs) {

    try {
        
            const { session, admin } = await authenticate.public.appProxy(request)
        
            if (session && admin) {
        
                const data = await request.json()
                
                // const reviewValid = await verifyReview(admin.graphql, data.email, data.productId)
        
                await db.productReview.create({data: {...data, store: session.shop, date: new Date(), isPublished: false}})
        
                return json({status: 'success'}, {status: 200})
        
                // return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
            } 
        
    } catch (error) {
        
        console.log(error)

    }
}
