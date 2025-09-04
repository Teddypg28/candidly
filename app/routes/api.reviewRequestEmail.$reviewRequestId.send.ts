import { ActionFunctionArgs } from "@remix-run/node";
import db from '../db.server'

import sendEmail from "~/helpers/email/sendEmail";
import { AppSettings, ReviewRequest, ReviewRequestEmailSettings, Subscription } from "@prisma/client";
import { ReviewRequestEmailVariables } from "~/types/types";
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";

export async function action( { request, params } : ActionFunctionArgs) {
  try {

    const reviewRequestId = params.reviewRequestId as number | string
    const data = await request.json()
    const store = data.store 

    const subscriptionData = await db.subscription.findFirst({where: {shop: {equals: store}}}) as Subscription
    if (subscriptionData.emailsSent === subscriptionData.emailQuota) return new Response(JSON.stringify({message: 'No more review request emails left. Upgrade your plan.'}), {status: 401, headers: {'Content-Type': 'application/json'}})
 
    const storeSessionDetails = await db.session.findFirst({where: {shop: {equals: store}}})
    const accessToken = storeSessionDetails?.accessToken as string
  
    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId as string}}}) as ReviewRequest
    
    const storeEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: store}}}) as ReviewRequestEmailSettings 
    & {
        logo: {
            name: string,
            url: string,
            file?: File
        } | null 
    }

    const storeEmailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: store}}, include: {logo: {omit: {emailDesignSettingsId: true, id: true}}}})
  
    let emailBody
    if (reviewRequest.emailsSent === 0) {
      emailBody = storeEmailSettings.initialEmailBody
    } else {
      emailBody = storeEmailSettings.followUpEmailBody
    }
  
    const firstName = reviewRequest.firstName
  
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
  
    const res = await fetch(`https://${store}/admin/api/2024-01/graphql.json`, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({query: productDetailsQuery})
      })
    const productData = await res.json()
    const lineItemData = productData.data.order.lineItems.edges
  
    // these are the line items still in the order - in case any items were removed between the order date and now
    const lineItems = lineItemData
      .map((edge: any) => {return {currentQuantity: edge.node.currentQuantity, productId: edge.node.product.id, title: edge.node.title, image: edge.node.image.url || ''}})
      .filter((productObj: {currentQuantity: number, productId: string, title: string, image: string}) => {
        if (productObj.currentQuantity > 0) return productObj
    })
  
    const emailVariables: ReviewRequestEmailVariables = {
      authToken: reviewRequest.authToken,
      reviewRequestId: reviewRequest.id,
      store: reviewRequest.store,
      firstName,
      lineItems
    }

    const emailSubject = reviewRequest.emailsSent === 0 ? storeEmailSettings.initialEmailSubject : storeEmailSettings.followUpEmailSubject

    // verify that we are able to send emails on behalf of the store's domain
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})
    const currentDomain = appSettings?.domain
    let fromEmailAddress = "reviews@trycandidly.app"
    if (currentDomain) {
      const verificationStatus = await verifyRecords(currentDomain)
      if (verificationStatus === "Success") fromEmailAddress = `reviews@${currentDomain}`
    }

    // send the email 
    await sendEmail(emailSubject, emailBody, emailVariables, storeEmailDesignSettings || {bannerBgColor: "black", logo: null}, reviewRequest.email, fromEmailAddress, "review-request")
    
    // update emails left count
    await db.subscription.update({where: {id: subscriptionData.id}, data: {emailsSent: subscriptionData.emailsSent + 1}})

    // update review request record
    const storeSettings = await db.appSettings.findFirst({where: {store: {equals: reviewRequest.store}}}) as AppSettings

    const generateNextDate = () => {
      // returns the next review request date using the second review request number of days setting
      const nextRequestDate = new Date(reviewRequest.nextRequestDate as any)
      nextRequestDate.setDate(nextRequestDate.getDate() + storeSettings.secondReviewRequest)
      nextRequestDate.setUTCHours(0, 0, 0, 0)
      return nextRequestDate
    }

    const updatedData = {
        emailsSent: reviewRequest.emailsSent + 1,
        nextRequestDate: reviewRequest.emailsSent === 0 ? generateNextDate() : null
    }
    await db.reviewRequest.update({where: {id: reviewRequest.id}, data: updatedData})

    return new Response(JSON.stringify({message: 'Email successfully sent'}), {status: 200, headers: {'Content-Type': 'application/json'}})

  } catch (error) {
    return new Response(JSON.stringify({message: 'Email failed to send'}), {status: 400, headers: {'Content-Type': 'application/json'}})
  }

}