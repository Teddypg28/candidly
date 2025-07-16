import { ActionFunctionArgs } from "@remix-run/node";

import db from '../db.server'

export const action = async ({ request } : ActionFunctionArgs) => {

    const data = await request.json()

    const shop = data.shop 

    const shopSession = await db.session.findFirst({where: {shop: {equals: `${shop}.myshopify.com`}}})
    if (!shopSession) return new Response(JSON.stringify({status: 'no valid session found'}), {status: 401})

    const value = data.value
    const accessToken = shopSession.accessToken

    const result = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({query: ''})
    })


}