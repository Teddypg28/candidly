import { ActionFunctionArgs, json } from "@remix-run/node"
import db from '../db.server'
import uploadMedia from "~/helpers/uploadMedia"
import sendReviewSubmittedNotificationEmail from "../helpers/email/sendReviewSubmittedNotificationEmail"
import updateReviewRequestProductRatingMetafields from "~/helpers/updateReviewRequestProductRatingMetafields"

export async function action({ request } : ActionFunctionArgs) {
    try {           

        const formData = await request.formData()

        // grab all uploaded media and remove from formData object so that it won't interfere with product review creation
        const uploadedMedia = formData.getAll('media') as File[] | String
        formData.delete('media')

        // convert form data to regular javascript object
        const data: any = Object.fromEntries(formData)

        const { authToken, reviewRequestId, store, productId, rating } = data

        const storeSessionDetails = await db.session.findFirst({where: {shop: {equals: `${store}.myshopify.com`}}})
        const accessToken = storeSessionDetails?.accessToken

        // make sure the request includes all of the necessary data to submit the review
        if (!store || !reviewRequestId || !authToken || !productId || !accessToken || !rating) {
            return new Response(JSON.stringify({status: 'Missing required data'}), {status: 400})
        }

        // validate review request
        const reviewRequestExists = await db.reviewRequest.findFirst({where: {authToken: {equals: authToken}, id: {equals: reviewRequestId}, store: {equals: `${store}.myshopify.com`}}})
        if (!reviewRequestExists) {
            return new Response(JSON.stringify({status: 'Unauthorized to submit review'}), {status: 401})
        }

        // make sure only 1 review is submitted per product
        const reviewExists = await db.productReview.findFirst({where: {reviewRequestId: {equals: reviewRequestId}, productId: {equals: productId}}})
        if (reviewExists) {
            return new Response(JSON.stringify({status: 'Review has already been submitted'}), {status: 401})
        }

        // remove authToken
        delete data['authToken']

        // isolate customQuestionAnswers
        const selectedAnswerChoices = JSON.parse(data.customQuestionAnswers)

        // remove it from main data object, so that review can be created
        delete data['customQuestionAnswers']
        delete data['reviewScore']

        // fetch store settings to check auto publishing rules
        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: `${store}.myshopify.com`}}})
        const isPublished = storeSettings?.autoPublishReviews[0] === "true" && rating >= storeSettings.minReviewRating 
        const newReview = await db.productReview.create({data: {...data, rating: parseInt(rating), store: `${store}.myshopify.com`, isPublished, reviewRequestId}})

        // notify store of the new review
        await sendReviewSubmittedNotificationEmail(newReview.id)

        // grab all of the ids connected to the selected answer choices
        const answerChoiceIds: string[] = []
        Object.keys(selectedAnswerChoices).forEach(questionIdKey => {
            if (selectedAnswerChoices[questionIdKey].value.length === 1) {
                answerChoiceIds.push(selectedAnswerChoices[questionIdKey].value[0])
            } else {
                selectedAnswerChoices[questionIdKey].value.forEach((answerChoiceId: string) => {
                    answerChoiceIds.push(answerChoiceId)
                })
            }
        })
                   
        // upload media images
        if (uploadedMedia.length > 0 && uploadedMedia[0] !== "") {
            if (uploadedMedia.length > 5) {
                const updatedUploadedMedia = (uploadedMedia as File[]).filter((file, index) =>  index !== uploadedMedia.length-1)
                await uploadMedia(updatedUploadedMedia, newReview.id)
            }
            await uploadMedia(uploadedMedia as File[], newReview.id)
        }

        // loop through ids and create answer choice snapshots and link them to review
        await Promise.all(answerChoiceIds.map(async (id) => {
            const answerChoiceData = await db.radioAnswerChoice.findFirst({where: {id}})
            if (answerChoiceData) {
                const data = {
                    display: answerChoiceData.display, 
                    label: answerChoiceData.label,
                    value: answerChoiceData.value,
                    questionId: answerChoiceData.questionId,
                    reviewId: newReview.id
                }
                return await db.answerChoiceSnapshot.create({data})
            }
        }))

        // mark review request as completed
        await db.reviewRequest.update({where: {id: reviewRequestId}, data: {isComplete: true}})

        // update product rating metafields
        await updateReviewRequestProductRatingMetafields(productId, rating, newReview.store)
        
        return json({status: 'Success', reviewId: newReview.id}, {status: 200})
    } 
        
     catch (error) {
        console.log(error)
        return new Response(JSON.stringify({status: `review creation failed: ${error}`}), {status: 400})
    }
}