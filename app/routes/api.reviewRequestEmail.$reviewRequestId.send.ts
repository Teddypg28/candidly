import { ActionFunctionArgs } from "@remix-run/node";
import db from '../db.server'

import sendEmail from "~/helpers/email/sendEmail";
import { AppSettings, ReviewRequest, ReviewRequestEmailSettings } from "@prisma/client";
import { ReviewRequestEmailData } from "~/types/types";
import fetchConfiguredQuestions from "~/helpers/questions/fetchConfiguredQuestions";
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";

export async function action( { request, params } : ActionFunctionArgs) {

  try {

    const reviewRequestId = params.reviewRequestId as number | string
  
    if (reviewRequestId === "test") {
        const formData = await request.formData()
        const emailBody = formData.get('emailBody') as string
        const emailData = JSON.parse(formData.get('emailData') as any)
        const store = formData.get('store') as string
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})
  
        if (appSettings) await sendEmail(emailBody, emailData, appSettings.primaryEmail, "support@trycandidly.app")
  
        return true      
    }
  
    const data = await request.json()
    const store = data.store 
  
    const storeSessionDetails = await db.session.findFirst({where: {shop: {equals: store}}})
    const accessToken = storeSessionDetails?.accessToken as string
  
    const reviewRequest = await db.reviewRequest.findFirst({where: {id: {equals: reviewRequestId as string}}}) as ReviewRequest
    const storeEmailSettings = await db.reviewRequestEmailSettings.findFirst({where: {store: {equals: store}}, include: {logo: true}}) as ReviewRequestEmailSettings 
    & {
        logo: {
            name: string,
            url: string,
            file?: File
        } | null 
    }
    const storeGeneralSettings = await db.appSettings.findFirst({where: {store: {equals: store}}}) as AppSettings
  
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
  
    const productIds: string[] = lineItems.map((item: {currentQuantity: number, productId: string, title: string, image: string}) => item.productId)
    const configuredQuestions = await Promise.all(productIds.map(async (id) => {
      const configuredQuestions = await fetchConfiguredQuestions(parseInt(id.split('Product/')[1]), store, accessToken)
      const questionIds = configuredQuestions.map(question => question.id)
      return questionIds
    }))
  
    const emailData: ReviewRequestEmailData = {
      authToken: reviewRequest.authToken,
      reviewRequestId: reviewRequest.id,
      bannerBgColor: storeEmailSettings.bannerBgColor,
      logo: storeEmailSettings.logo,
      companyName: storeGeneralSettings.companyName,
      store: reviewRequest.store,
      subject: reviewRequest.emailsSent === 0 ? storeEmailSettings.initialEmailSubject : storeEmailSettings.followUpEmailSubject,
      firstName,
      lineItems,
      configuredQuestions
    }

    // verify that we are able to send emails on behalf of the store's domain
    const appSettings = await db.appSettings.findFirst({where: {store: {equals: store}}})
    const currentDomain = appSettings?.domain
    let fromEmailAddress = "reviews@trycandidly.app"
    if (currentDomain) {
      const verificationStatus = await verifyRecords(currentDomain)
      if (verificationStatus === "Success") fromEmailAddress = `reviews@${currentDomain}`
    }
  
    // send the email
    await sendEmail(emailBody, emailData, "theopop28@gmail.com", fromEmailAddress)
      
    return new Response(JSON.stringify({message: 'Email successfully sent'}), {status: 200, headers: {'Content-Type': 'application/json'}})

  } catch (error) {
    return new Response(JSON.stringify({message: 'Email failed to send'}), {status: 400, headers: {'Content-Type': 'application/json'}})
  }

}