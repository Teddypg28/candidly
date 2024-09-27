import { ActionFunctionArgs } from "@remix-run/node"
import { authenticate } from "~/shopify.server"
import db from '../db.server'

import verifyReview from "~/helpers/verifyReview"

export async function action({request} : ActionFunctionArgs) {

    try {

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

            await db.productReview.create({data: {...data, store: session.shop, date: new Date(), customQuestionAnswers: {create: customQuestionAnswerData}}})

            const totalReviews = await db.productReview.findMany({where: {productId: {equals: data.productId}, AND: {store: {equals: session.shop}}}})

            let totalReviewsScore = 0

            totalReviews.forEach(review => {
                totalReviewsScore += review.rating
            })

            const metafields = admin.rest.resources.Metafield.all({product_id: data.productId, session});
    
            const metafieldsData = (await metafields).data

            for (let i = 0; i<metafieldsData.length; i++) {

                if (metafieldsData[i].owner_id === data.productId) {

                    const updatedValue = Math.round((totalReviewsScore / totalReviews.length) * 2) / 2

                    const metafield = new admin.rest.resources.Metafield({session});

                    metafield.id = metafieldsData[i].id;
                    metafield.value = updatedValue;
                    metafield.type = "number_decimal";

                    await metafield.save({
                        update: true,
                    });

                    break
                    
                }

            }

            return new Response(JSON.stringify({status: 'success'}), {status: 200})

            // return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
        }


    } catch (error) {

        console.log(error)

        return new Response(JSON.stringify({error}), {status: 500})

    }   
}
