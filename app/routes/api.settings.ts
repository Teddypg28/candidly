import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

export async function loader({request} : LoaderFunctionArgs) {
    try {
        const { session } = await authenticate.public.appProxy(request)
        // fetch all settings connected to the shop domain returned during authentication
        const result = await db.reviewFormSettings.findFirst({where: {store: {equals: session?.shop}}})
        if (result) {
            const { primaryFormColor, heading, subheading } = result
            return new Response(JSON.stringify({ formHeading: heading, formSubheading: subheading, primaryColor: primaryFormColor, backgroundColor: 'white' }), {status: 200})
        } else {
            return new Response(JSON.stringify({error: 'Settings not yet configured'}), {status: 400})
        }
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500})
    }
}