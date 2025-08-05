import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

import db from '../db.server'
import sendCustomerQuestionNotificationEmail from "~/helpers/email/sendCustomerQuestionNotificationEmail";

export async function action({ request } : ActionFunctionArgs) {
    try {     
        const { session } = await authenticate.public.appProxy(request)
        if (session) {
            const questionData = await request.json()
            const { title, productId, firstName, email } = questionData
            // save the customer question in the db
            const customerQuestion = await db.customerQuestion.create({data: {title, productId, firstName, email, store: session.shop}})
            // notify store of new customer question
            await sendCustomerQuestionNotificationEmail(customerQuestion)
            return new Response(JSON.stringify({status: 'success'}), {status: 200})
        }
    } catch (error) {
        return new Response(JSON.stringify({error}), {status: 500})
    }
}