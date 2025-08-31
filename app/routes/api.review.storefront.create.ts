import { ActionFunctionArgs, json } from "@remix-run/node"
import db from '../db.server'
import uploadMedia from "~/helpers/uploadMedia"
import { authenticate } from "~/shopify.server"
import sendReviewSubmittedNotificationEmail from "~/helpers/email/sendReviewSubmittedNotificationEmail"
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields"

export async function action({ request } : ActionFunctionArgs) {
    try {            

        const { admin, session } = await authenticate.public.appProxy(request)

        if (!session) return new Response(JSON.stringify({status: 'Invalid session'}), {status: 401})

        const formData = await request.formData()

        // grab all uploaded media and remove from formData object so that it won't interfere with product review creation
        const uploadedMedia = formData.getAll('media') as File[] | String
        formData.delete('media')

        // convert form data to regular javascript object
        const data: any = Object.fromEntries(formData)

        // isolate customQuestionAnswers
        const selectedAnswerChoices = JSON.parse(data.customQuestionAnswers)

        // remove it from main data object, so that review can be created
        delete data['customQuestionAnswers']

        // fetch store settings to check auto publishing rules
        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: session?.shop}}})
        const isPublished = storeSettings?.autoPublishReviews[0] === "true" && data.rating >= storeSettings.minReviewRating 
        const newReview = await db.productReview.create({data: {...data, rating: parseInt(data.rating), store: session?.shop, isPublished}})
       
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


        // update product rating metafields
        await updateProductRatingMetafields(newReview.productId, newReview.rating, admin, session)

        return json({status: 'success'}, {status: 200})
    } 
        
     catch (error) {
        console.log(error)
        return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
    }
}