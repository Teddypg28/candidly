import { ActionFunctionArgs, json } from "@remix-run/node"
import db from '../db.server'
import uploadMedia from "~/helpers/uploadMedia"
import isGibberish from "~/helpers/gibberish/isGibberish"
import fetchRewardTiers from "~/helpers/rewards/fetchRewardTiers"

export async function action({ request } : ActionFunctionArgs) {
    try {            

        const formData = await request.formData()

        // convert form data to regular javascript object
        const data: any = Object.fromEntries(formData)

        const { authToken, reviewRequestId, store, productId, rating, reviewScore, body, title } = data

        // make sure the request includes all of the necessary data to submit the review
        if (!store || !reviewRequestId || !authToken || !productId) {
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

        // make sure there isn't gibberish being entered for the review
        if (isGibberish(title) || isGibberish(body)) {
            return new Response(JSON.stringify({status: 'Uh oh! We detected some gibberish in your review!'}), {status: 400})
        }

        // grab all uploaded media and remove from formData object so that it won't interfere with product review creation
        const uploadedMedia = formData.getAll('media') as File[]
        formData.delete('media')

        // remove authToken
        delete data['authToken']

        // isolate customQuestionAnswers
        const selectedAnswerChoices = JSON.parse(data.selectedAnswerChoices)

        // remove it from main data object, so that review can be created
        delete data['selectedAnswerChoices']
        delete data['customQuestionAnswers']

        // fetch store settings to check auto publishing rules
        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: `${store}.myshopify.com`}}})
        const isPublished = storeSettings?.autoPublishReviews[0] === "true" && rating >= storeSettings.minReviewRating 
        const newReview = await db.productReview.create({data: {...data, rating: parseInt(rating), store: `${store}.myshopify.com`, date: new Date(), isPublished, reviewRequestId}})

        // grab all of the ids connected to the selected answer choices
        const answerChoiceIds: string[] = []
        Object.keys(selectedAnswerChoices).forEach(questionIdKey => {
            if (typeof selectedAnswerChoices[questionIdKey] === "string") {
                answerChoiceIds.push(selectedAnswerChoices[questionIdKey])
            } else {
                selectedAnswerChoices[questionIdKey].forEach((answerChoice: {id: string, value: string}) => {
                    answerChoiceIds.push(answerChoice.id)
                })
            }
        })
                
        // upload media images
        if (uploadedMedia.length > 0) {
            await uploadMedia(uploadedMedia, newReview.id)
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

        // send customer a discount reward email if there is one configured
        if (reviewScore > 0) {
            const rewards = await db.reward.findFirst({where: {store: {equals: `${store}.myshopify.com`}}})
            if (rewards) {
                const rewardTierIds = [rewards.subparId, rewards.goodId, rewards.perfectId]
                const rewardSettings = await db.rewardSetting.findFirst({where: {id: {equals: rewardTierIds[reviewScore-1]}}})
                if (rewardSettings && rewardSettings.selectedRewardType !== "none") {
                    switch (rewardSettings.selectedRewardType) {
                        case "free-shipping":
                            
                            break;
                        
                        case "dollar":

                            break;

                        case "percent":

                            break;

                        case "bogo":

                            break;

                        default:
                            break;
                    }
                }
            
            }
        }
        
        return json({status: 'Success'}, {status: 200})
    } 
        
     catch (error) {
        console.log(error)
        return new Response(JSON.stringify({status: 'Review verification failed'}), {status: 400})
    }
}