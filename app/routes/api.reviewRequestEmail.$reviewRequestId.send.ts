import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

import sendEmail from "~/helpers/email/sendEmail";
import { AppSettings, ReviewRequest, ReviewRequestEmailSettings } from "@prisma/client";
import { ReviewRequestEmailData } from "~/types/types";
import fetchMaxReward from "~/helpers/fetchMaxReward.server";

export async function action( { request, params } : ActionFunctionArgs) {
    const { session, admin } = await authenticate.admin(request)

    const reviewRequestId = params.reviewRequestId as number | string

    if (reviewRequestId === "test") {
        const formData = await request.formData()
        const emailBody = formData.get('emailBody') as string
        const emailData = JSON.parse(formData.get('emailData') as any)
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}})

        // replace mrgiftr email with ratesphere app email whenever its purchased
        if (appSettings) await sendEmail(emailBody, emailData, "mrgiftr@gmail.com", appSettings.primaryEmail)

        return true      
    }

    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId as number}}}) as ReviewRequest
    const storeEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: session.shop}}, include: {logo: true}}) as ReviewRequestEmailSettings 
    & {
        logo: {
            name: string,
            url: string,
            file?: File
        } | null 
    }
    const storeGeneralSettings = await db.appSettings.findFirst({where: {store: {equals: session.shop}}}) as AppSettings

    let emailBody
    if (reviewRequest.emailsSent === 0) {
        emailBody = storeEmailSettings.initialEmailBody
    } else {
        emailBody = storeEmailSettings.followUpEmailBody
    }

    const firstName = ''
    const maxReward = await fetchMaxReward(session.shop)

    const emailData: ReviewRequestEmailData = {
        reviewRequestId: reviewRequest.id,
        bannerBgColor: storeEmailSettings.bannerBgColor,
        logo: storeEmailSettings.logo,
        companyName: storeGeneralSettings.companyName,
        store: reviewRequest.store,
        firstName,
        maxReward
    }
}