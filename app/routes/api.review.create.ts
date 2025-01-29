import { ActionFunctionArgs, json } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'
import uploadMedia from "~/helpers/uploadMedia"

export async function action({ request } : ActionFunctionArgs) {
    try {            
            const { session, admin } = await authenticate.public.appProxy(request)
            if (session && admin) {
                const formData = await request.formData()
                // grab all uploaded media and remove from formData object so that it won't interfere with product preview creation
                const uploadedMedia = formData.getAll('media') as File[]
                formData.delete('media')
                // convert form data to regular javascript object
                const data: any = Object.fromEntries(formData)
                // isolate customQuestionAnswers
                const customQuestionAnswersData = JSON.parse(data.customQuestionAnswers)
                // remove it from main data object, so that review can be created
                delete data['customQuestionAnswers']
                delete data['media']
                const newReview = await db.productReview.create({data: {...data, rating: parseInt(data.rating), store: session.shop, date: new Date(), isPublished: false}})
                // upload media images
                if (uploadedMedia.length > 0) {
                   await uploadMedia(uploadedMedia, newReview.id)
                }
                // returns an object with the text responses and the questionId of the custom text field questions
                const customTextFieldQuestionData = Object.keys(customQuestionAnswersData)
                    .filter(key => customQuestionAnswersData[key].type === 'text')
                    .map(key => {return {questionId: key.split('-')[1], value: customQuestionAnswersData[key].value}})
                // loop through each text response and create db entry for each one
                await Promise.all(customTextFieldQuestionData.map(async (answer) => {
                    const data = {
                        value: answer.value, 
                        questionId: parseInt(answer.questionId), 
                        reviewId: newReview.id
                    }
                    return db.textAnswer.create({data})
                }))
                // returns array of ids connected to the selected answer choices
                const answerChoiceIds = Object.keys(customQuestionAnswersData)
                    .filter(key => customQuestionAnswersData[key].type === 'radio')
                    .map(key => customQuestionAnswersData[key].value)
                    .flat()
                // loop through ids and create answer choice snapshots and link them to review
                await Promise.all(answerChoiceIds.map(async (id) => {
                    const answerChoiceData = await db.radioAnswerChoice.findFirst({where: {id: Number(id)}})
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
                return json({status: 'success'}, {status: 200})
            } 
        
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
    }
}
