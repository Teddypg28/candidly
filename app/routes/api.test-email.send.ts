import { ActionFunctionArgs } from "@remix-run/node"

import db from '../db.server'
import sendEmail from "~/helpers/email/sendEmail"
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords"

export async function action({ request } : ActionFunctionArgs) {
    const data = await request.formData()

    const type = data.get("type")
    const store = data.get('store') as string

    const emailHeaderStyles = await db.emailDesignSettings.findFirst({where: {store: {equals: store}}, include: {logo: {omit: {emailDesignSettingsId: true, id: true}}}})
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})
    const emailBody = data.get('emailBody') as string
    const emailData = JSON.parse(data.get('emailData') as any)

    if (!type || !store || !emailHeaderStyles || !appSettings || !emailBody || !emailData) return new Response(JSON.stringify({error: "missing required variables"}), {status: 401})
    
    const currentDomain = appSettings?.domain
    let fromEmailAddress = `${type === "review-request" ? "reviews" : type === "customer-question" ? "questions" : "rewards"}@trycandidly.app`
    if (currentDomain) {
      const verificationStatus = await verifyRecords(currentDomain)
      if (verificationStatus === "Success") fromEmailAddress = `${type === "review-request" ? "reviews" : type === "customer-question" ? "questions" : "rewards"}@${currentDomain}`
    }

    await sendEmail(emailBody, emailData, emailHeaderStyles, appSettings.primaryEmail, fromEmailAddress, type as "review-request" | "customer-question" | "customer-reward")
     
    return new Response(JSON.stringify({status: "test email successfully sent"}), {status: 200})
}