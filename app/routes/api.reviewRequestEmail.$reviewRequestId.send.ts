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

    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId as string}}}) as ReviewRequest
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

    const productDetailsQuery = `{
        order(id: "gid://shopify/Order/${reviewRequest.orderId}") {
          id
          lineItems(first: 25) {
            edges {
              node {
                currentQuantity
                product{
                  id
                }
                title
                image {
                  url
                }
              }
            }
          }
        }
      }`

    const res = await admin.graphql(productDetailsQuery)
    const data = await res.json()
    const lineItemData = data.data.order.lineItems.edges

    // these are the line items still in the order - in case any items were removed between the order date and now
    const lineItems = lineItemData.filter((edge: any) => {
        if (edge.node.currentQuantity > 0) {
          return {productId: edge.node.product.id, title: edge.node.title, image: edge.node.image.url || ''}
        }
    })

    const emailData: ReviewRequestEmailData = {
        authToken: reviewRequest.authToken,
        reviewRequestId: reviewRequest.id,
        bannerBgColor: storeEmailSettings.bannerBgColor,
        logo: storeEmailSettings.logo,
        companyName: storeGeneralSettings.companyName,
        store: reviewRequest.store,
        firstName,
        maxReward,
        lineItems
    }

    await sendEmail(emailBody, emailData, "mrgiftr@gmail.com", "teddypg02@gmail.com")

}