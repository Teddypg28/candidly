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

            const metafields = await admin.rest.resources.Metafield.all({product_id: data.productId, session});
    
            const ratingMetafieldExists = metafields.data.find((metafield: any) => metafield.owner_id === data.productId && metafield.key === 'rating')

            if (ratingMetafieldExists) {

                const ratingCountMetafield = metafields.data.find((metafield: any) => metafield.owner_id === data.productId && metafield.key === 'rating_count')

                const totalReviews = await db.productReview.findMany({where: {productId: {equals: data.productId}, AND: {store: {equals: session.shop}}}})

                let totalReviewsScore = 0

                totalReviews.forEach(review => {
                    totalReviewsScore += review.rating
                })

                const updatedAvgProductRating = Math.round((totalReviewsScore / totalReviews.length) * 2) / 2

                const updatedRatingMetafield = new admin.rest.resources.Metafield({session: session});

                updatedRatingMetafield.namespace = "reviews";
                updatedRatingMetafield.key = "rating";
                updatedRatingMetafield.product_id = data.productId;
                updatedRatingMetafield.id = ratingMetafieldExists.id;
                updatedRatingMetafield.value = JSON.stringify({value: updatedAvgProductRating, scale_min: 1.0, scale_max: 5.0});
                updatedRatingMetafield.type = "rating";

                await updatedRatingMetafield.save({
                    update: true,
                });

                const updatedRatingCountMetafield = new admin.rest.resources.Metafield({session: session});

                updatedRatingCountMetafield.namespace = "reviews";
                updatedRatingCountMetafield.key = "rating_count";
                updatedRatingCountMetafield.product_id = data.productId;
                updatedRatingCountMetafield.id = ratingCountMetafield.id;
                updatedRatingCountMetafield.value = totalReviews.length;
                updatedRatingCountMetafield.type = "number_integer";

                await updatedRatingCountMetafield.save({
                    update: true,
                });

            } else {

                const newRatingMetafield = await new admin.rest.resources.Metafield({session})

                newRatingMetafield.namespace = "reviews";
                newRatingMetafield.key = "rating";
                newRatingMetafield.product_id = data.productId;
                newRatingMetafield.value = JSON.stringify({value: data.rating, scale_min: 1.0, scale_max: 5.0});
                newRatingMetafield.type = "rating";
                await newRatingMetafield.save({
                    update: true,
                });

                const newRatingCountMetafield = await new admin.rest.resources.Metafield({session})

                newRatingCountMetafield.product_id = data.productId;
                newRatingCountMetafield.namespace = "reviews";
                newRatingCountMetafield.key = "rating_count";
                newRatingCountMetafield.value = 1;
                newRatingCountMetafield.type = "number_integer";
                await newRatingCountMetafield.save({
                    update: true,
                });

            }

            return new Response(JSON.stringify({status: 'success'}), {status: 200})

            // return new Response(JSON.stringify({status: 'review verification failed'}), {status: 400})
        }


    } catch (error) {

        console.log(error)

        return new Response(JSON.stringify({error}), {status: 500})

    }   
}
