import { SessionData } from "@remix-run/node";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

import db from '../db.server'
import updateProductRatingMetafields from "~/helpers/updateProductRatingMetafields";

export default async function publishReviews(session: SessionData, admin: AdminApiContext, reviewIds: any[]) {

    try {

        const result = await Promise.all(reviewIds.map(async (id) => {

            return await db.productReview.update({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}, data: {isPublished: true}})
    
        }))


        // Grab all the product ids of the reviews you just published
        const productIds = result.map(publishedReview => publishedReview.productId)
        const filteredProductIds = productIds.filter((productId, index) => {

            if (productIds.indexOf(productId) === index) {
                return productId
            }

        })

        // Using each product id, loop through the published reviews, find reviews with matching product id
        // Compute the total, rounded avg rating -- push total avg rating at once without having to push each individual rating

        await Promise.all(filteredProductIds.map(async (productId) => {

            let totalRatingScore = 0
            let reviewCount = 0

            result.forEach(publishedReview => {
                if (publishedReview.productId === productId) {
                    totalRatingScore += publishedReview.rating
                    reviewCount += 1
                }
            })

            const avgProductRating = Math.round((totalRatingScore / reviewCount) * 2) / 2

            const serializedProductId = parseInt(productId.toString())

            return await updateProductRatingMetafields(serializedProductId, avgProductRating, admin, session)

        }))

        return {success: true}
        
    } catch (error) {
        
        return {success: false}
        
    }

}