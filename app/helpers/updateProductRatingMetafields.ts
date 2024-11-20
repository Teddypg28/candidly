import { SessionData } from "@remix-run/node";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";

import db from '../db.server'

export default async function updateProductRatingMetafields(productId: string, rating: number, admin: AdminApiContext, session: SessionData) {

    const totalReviews = await db.productReview.findMany({where: {productId: {equals: productId}, AND: {store: {equals: session.shop}, AND: {isPublished: {equals: true}}}}})
    const metafields = await admin.rest.resources.Metafield.all({product_id: productId, session});    

    // see if rating metafield exists
    const ratingMetafield = metafields.data.find((metafield: any) => metafield.owner_id === productId && metafield.key === 'rating')

    if (ratingMetafield) {

        // if it exists, that means rating count metafield also exists
        const ratingCountMetafield = metafields.data.find((metafield: any) => metafield.owner_id === productId && metafield.key === 'rating_count')

        let totalReviewsScore = 0
        totalReviews.forEach(review => {
            totalReviewsScore += review.rating
        })

        const updatedAvgProductRating = Math.round((totalReviewsScore / totalReviews.length) * 2) / 2

        const updatedRatingMetafield = new admin.rest.resources.Metafield({session: session});
        updatedRatingMetafield.namespace = "reviews";
        updatedRatingMetafield.key = "rating";
        updatedRatingMetafield.type = "rating";
        updatedRatingMetafield.product_id = productId;
        updatedRatingMetafield.id = ratingMetafield.id;
        updatedRatingMetafield.value = JSON.stringify({value: updatedAvgProductRating, scale_min: 1.0, scale_max: 5.0});

        await updatedRatingMetafield.save({
            update: true,
        });

        const updatedRatingCountMetafield = new admin.rest.resources.Metafield({session: session});
        updatedRatingCountMetafield.namespace = "reviews";
        updatedRatingCountMetafield.key = "rating_count";
        updatedRatingCountMetafield.type = "number_integer";
        updatedRatingCountMetafield.product_id = productId;
        updatedRatingCountMetafield.id = ratingCountMetafield.id;
        updatedRatingCountMetafield.value = totalReviews.length;

        await updatedRatingCountMetafield.save({
            update: true,
        });

    } else {

        // initialize rating and rating count metafields since they do not already exist

        const newRatingMetafield = await new admin.rest.resources.Metafield({session})
        newRatingMetafield.namespace = "reviews";
        newRatingMetafield.key = "rating";
        newRatingMetafield.type = "rating";
        newRatingMetafield.product_id = productId;
        newRatingMetafield.value = JSON.stringify({value: rating, scale_min: 1.0, scale_max: 5.0});

        await newRatingMetafield.save({
            update: true,
        });

        const newRatingCountMetafield = await new admin.rest.resources.Metafield({session})
        newRatingCountMetafield.namespace = "reviews";
        newRatingCountMetafield.key = "rating_count";
        newRatingCountMetafield.type = "number_integer";
        newRatingCountMetafield.product_id = productId;
        newRatingCountMetafield.value = totalReviews.length;

        await newRatingCountMetafield.save({
            update: true,
        });
    }
}