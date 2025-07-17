import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import db from '../db.server'

export async function action({ request } : ActionFunctionArgs) {
    try {     
        const { session } = await authenticate.public.appProxy(request)
    
        if (session) {
            const questionData = await request.json()
            const { title, productId, firstName, email } = questionData
            return await db.customerQuestion.create({data: {title, productId, firstName, email, store: session.shop}})
        }
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500})
    }
}