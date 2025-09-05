import { ActionFunctionArgs } from "@remix-run/node"

import db from '../db.server'
import { authenticate } from "~/shopify.server"

export async function action({ request } : ActionFunctionArgs) {
    try {
        const { session } = await authenticate.admin(request)
    
        const data = await request.json()
        const subscription = await db.subscription.findFirst({where: {shop: {equals: session.shop}}})

        if (!data.timezone || !subscription) return new Response(JSON.stringify({status: "missing required data or subscription does not exist"}), {status: 200})
    
        await db.subscription.update({where: {id: subscription.id}, data: {...data}})
    
        return new Response(JSON.stringify({status: "timezone successfully initialized"}), {status: 200})
    } catch (error) {
        return new Response(JSON.stringify({status: `error initializing subscription timezone: ${error}`}), {status: 200})
    }
}