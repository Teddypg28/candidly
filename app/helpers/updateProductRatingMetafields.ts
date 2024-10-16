import { SessionData } from "@remix-run/node";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

import db from '../db.server'

export default async function updateProductRatingMetafields(productId: number, rating: number, admin: AdminApiContext, session: SessionData) {

    const metafields = await admin.rest.resources.Metafield.all({product_id: productId, session});
            
    const ratingMetafieldExists = metafields.data.find((metafield: any) => metafield.owner_id === productId && metafield.key === 'rating')

        if (ratingMetafieldExists) {
    
            const ratingCountMetafield = metafields.data.find((metafield: any) => metafield.owner_id === productId && metafield.key === 'rating_count')
    
            const totalReviews = await db.productReview.findMany({where: {productId: {equals: productId}, AND: {store: {equals: session.shop}}}})
    
            let totalReviewsScore = 0
    
            totalReviews.forEach(review => {
                totalReviewsScore += review.rating
            })
    
            const updatedAvgProductRating = Math.round((totalReviewsScore / totalReviews.length) * 2) / 2
    
            const updatedRatingMetafield = new admin.rest.resources.Metafield({session: session});
    
            updatedRatingMetafield.namespace = "reviews";
            updatedRatingMetafield.key = "rating";
            updatedRatingMetafield.product_id = productId;
            updatedRatingMetafield.id = ratingMetafieldExists.id;
            updatedRatingMetafield.value = JSON.stringify({value: updatedAvgProductRating, scale_min: 1.0, scale_max: 5.0});
            updatedRatingMetafield.type = "rating";
    
            await updatedRatingMetafield.save({
                update: true,
            });
    
            const updatedRatingCountMetafield = new admin.rest.resources.Metafield({session: session});
    
            updatedRatingCountMetafield.namespace = "reviews";
            updatedRatingCountMetafield.key = "rating_count";
            updatedRatingCountMetafield.product_id = productId;
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
            newRatingMetafield.product_id = productId;
            newRatingMetafield.value = JSON.stringify({value: rating, scale_min: 1.0, scale_max: 5.0});
            newRatingMetafield.type = "rating";
            await newRatingMetafield.save({
                update: true,
            });
    
            const newRatingCountMetafield = await new admin.rest.resources.Metafield({session})
    
            newRatingCountMetafield.product_id = productId;
            newRatingCountMetafield.namespace = "reviews";
            newRatingCountMetafield.key = "rating_count";
            newRatingCountMetafield.value = 1;
            newRatingCountMetafield.type = "number_integer";
            await newRatingCountMetafield.save({
                update: true,
            });
    
    }
}
