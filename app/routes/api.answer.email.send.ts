import { ActionFunctionArgs } from "@remix-run/node";
import sendEmail from "~/helpers/email/sendEmail";
import { CustomerQuestionEmailData, defaultCustomerQuestionEmailSettings } from "~/types/types";
import db from '../db.server'
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {      
        const data = await request.json()
    
        const emailData: CustomerQuestionEmailData = data.emailData 
    
        if (!emailData.answer) {
            return new Response(JSON.stringify({error: "missing required answer"}), {status: 401})
        }

        const emailSettings = await db.customerQuestionEmailSettings.findFirst({where: {store: {equals: data.store}}})
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: data.store}}})
        const emailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: data.store}}, include: {logo: {omit: {id: true, emailDesignSettingsId: true}}}})

        const currentDomain = appSettings?.domain

        let fromEmailAddress = "questions@trycandidly.app"
        if (currentDomain) {
            const verificationStatus = await verifyRecords(currentDomain)
            if (verificationStatus === "Success") fromEmailAddress = `questions@${currentDomain}`
        }

        await sendEmail(
            emailSettings?.body || defaultCustomerQuestionEmailSettings.body, 
            {...emailData, subject: emailSettings?.subject as string, companyName: appSettings?.companyName}, 
            emailDesignSettings || {bannerBgColor: 'black', logo: null}, 
            data.toAddress, 
            fromEmailAddress,
            "customer-question"
            )

        return new Response(JSON.stringify({status: "email successfully sent"}), {status: 200})

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({error: "something went wrong"}), {status: 400})
    }
}