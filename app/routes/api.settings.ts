import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

import { hsbToHex } from "@shopify/polaris";

export async function loader({request} : LoaderFunctionArgs) {

    const { session } = await authenticate.public.appProxy(request)

    try {

        const result = await db.reviewSettings.findFirst({where: {store: {equals: session?.shop}}})

        if (result) {
            
            const { formHeading, formSubheading, primaryColor, backgroundColor } = result

            const hexPrimaryColorCode = hsbToHex(JSON.parse(primaryColor))
            const hexBackgroundColorCode = hsbToHex(JSON.parse(backgroundColor))

            return new Response(JSON.stringify({ formHeading, formSubheading, primaryColor: hexPrimaryColorCode, backgroundColor: hexBackgroundColorCode }), {status: 200})

        } else {

            return new Response(JSON.stringify({error: 'settings not yet configured'}), {status: 400})

        }

        
    } catch (error) {

        console.log(error)

        return new Response(JSON.stringify({error}), {status: 500})

    }
}