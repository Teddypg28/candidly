import { SessionData } from "@remix-run/node"
import { AdminApiContext } from "@shopify/shopify-app-remix/server"

import db from '../db.server'

export default async function deleteReviews(session: SessionData, admin: AdminApiContext, reviewIds: any) {

    try {
        
        const productIds: any = []
    
        const deletedReviews = await Promise.all(reviewIds.map(async (id: string) => {
    
            return await db.productReview.delete({where: {id: parseInt(id), AND: {store: {equals: session.shop}}}})
    
        }))
    
        deletedReviews.forEach(review => productIds.push(review.productId))
    
        const updateMetafield = async (productId: any) => {
    
            const ratingMetafields = await admin.rest.resources.Metafield.all({session, product_id: productId})
    
            const ratingScoreMetafield = ratingMetafields.data.find((metafield: any) => metafield.key === 'rating')
            const ratingCountMetafield = ratingMetafields.data.find((metafield: any) => metafield.key === 'rating_count')
    
            if (ratingScoreMetafield && ratingCountMetafield) {
    
                const totalReviews = await db.productReview.findMany({where: {productId: {equals: productId}, AND: {store: {equals: session.shop}}}})
    
                let totalReviewsScore = 0
    
                if (totalReviews.length === 0 && ratingScoreMetafield.id && ratingCountMetafield.id) {
    
                    await admin.rest.resources.Metafield.delete({session, id: ratingCountMetafield.id})
                    await admin.rest.resources.Metafield.delete({session, id: ratingScoreMetafield.id})
    
                    return
    
                }
    
                totalReviews.forEach(review => {
                    totalReviewsScore += review.rating
                })
    
                const updatedAvgProductRating = Math.round((totalReviewsScore / totalReviews.length) * 2) / 2
    
                const updatedRatingMetafield = new admin.rest.resources.Metafield({session: session});
    
                updatedRatingMetafield.product_id = ratingScoreMetafield.owner_id;
                updatedRatingMetafield.id = ratingScoreMetafield.id;
                updatedRatingMetafield.type = "rating";
                updatedRatingMetafield.value = JSON.stringify({value: updatedAvgProductRating, scale_min: 1.0, scale_max: 5.0});
    
                await updatedRatingMetafield.save({
                    update: true,
                })
    
                const updatedRatingCountMetafield = new admin.rest.resources.Metafield({session: session});
    
                updatedRatingCountMetafield.product_id = ratingCountMetafield.owner_id;
                updatedRatingCountMetafield.id = ratingCountMetafield.id;
                updatedRatingCountMetafield.type = "number_integer";
                updatedRatingCountMetafield.value = totalReviews.length;
    
                await updatedRatingCountMetafield.save({
                    update: true,
                });
    
                return true
            }
        }
    
        await Promise.all(productIds.map(async (id: any) => {
    
            return await updateMetafield(id)
    
        }))
    
        return {success: true}

    } catch (error) {

        console.log(error)

        return {success: false}
        
    }

        
}