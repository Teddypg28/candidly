import { ActionFunctionArgs } from "@remix-run/node"

import db from '../db.server'
import sendEmail from "~/helpers/email/sendEmail"

export async function action({ request } : ActionFunctionArgs) {
    const data = await request.formData()

    const type = data.get("type")
    const store = data.get('store') as string

    const emailHeaderStyles = await db.emailDesignSettings.findFirst({where: {store: {equals: store}}, include: {logo: {omit: {emailDesignSettingsId: true, id: true}}}})
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})

    const emailBody = data.get('body') as string
    const emailSubject = data.get('subject') as string
    const variables = JSON.parse(data.get('variables') as any)

    if (!type || !store || !emailHeaderStyles || !appSettings || !emailBody || !emailSubject || !variables) return new Response(JSON.stringify({error: "missing required variables"}), {status: 401})
    
    const fromEmailAddress = `${type === "review-request" ? "reviews" : type === "customer-question" ? "questions" : "rewards"}@trycandidly.app`

    await sendEmail(emailSubject, emailBody, variables, emailHeaderStyles, appSettings.primaryEmail, fromEmailAddress, type as "review-request" | "customer-question" | "customer-reward")
     
    return new Response(JSON.stringify({status: "test email successfully sent"}), {status: 200})
}