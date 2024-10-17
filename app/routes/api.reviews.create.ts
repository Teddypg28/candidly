import { ActionFunctionArgs, json } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'

import verifyReview from "~/helpers/verifyReview"
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields"

export async function action({ request } : ActionFunctionArgs) {

    const { session, admin } = await authenticate.public.appProxy(request)

    if (session && admin) {

        const data = await request.json()

        const dataKeys = Object.keys(data)

        const promises: any = []

        const customQuestionAnswerData: any = []

        dataKeys.forEach((key) => {

            if (key.includes('customQuestion')) {

                const fillAnswerData = (async () => {

                    const keyData = {...data[key]}

                    delete data[key]

                    const id = parseInt(key.split('-')[1])

                    const result = await db.reviewFormQuestion.findFirst({where: { id: {equals: id} }})

                    const answerLabel = result?.answerLabel

                    customQuestionAnswerData.push({label: answerLabel, ...keyData})

                })()

                promises.push(fillAnswerData)

            }
        })

        await Promise.all(promises)

        // const reviewValid = await verifyReview(admin.graphql, data.email, data.productId)

        await db.productReview.create({data: {...data, store: session.shop, date: new Date(), isPublished: false, customQuestionAnswers: {create: customQuestionAnswerData}}})

        return json({status: 'success'}, {status: 200})

        // return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
    } 
}
