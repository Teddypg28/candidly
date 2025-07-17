import { ActionFunctionArgs } from "@remix-run/node";
import sendEmail from "~/helpers/email/sendEmail";
import { CustomerQuestionEmailVariables, CustomerRewardEmailVariables, defaultCustomerRewardEmailSettings } from "~/types/types";
import db from '../db.server'
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {      
        const data = await request.json()
    
        const emailData: CustomerRewardEmailVariables = data.emailData 
    
        if (!emailData.reward) {
            return new Response(JSON.stringify({error: "missing required reward"}), {status: 401})
        }

        const emailSettings = await db.customerRewardEmailSettings.findFirst({where: {store: {equals: data.store}}})
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: data.store}}})
        const emailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: data.store}}, include: {logo: {omit: {id: true, emailDesignSettingsId: true}}}})

        const currentDomain = appSettings?.domain
        let fromEmailAddress = "rewards@trycandidly.app"
        if (currentDomain) {
            const verificationStatus = await verifyRecords(currentDomain)
            if (verificationStatus === "Success") fromEmailAddress = `rewards@${currentDomain}`
        }

        await sendEmail(
            emailSettings?.subject as string,
            emailSettings?.body || defaultCustomerRewardEmailSettings.body, 
            {...emailData, companyName: appSettings?.companyName}, 
            emailDesignSettings || {bannerBgColor: 'black', logo: null}, 
            data.toAddress, 
            fromEmailAddress,
            "customer-reward"
        )

        return new Response(JSON.stringify({status: "email successfully sent"}), {status: 200})

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({error: "something went wrong"}), {status: 400})
    }
}