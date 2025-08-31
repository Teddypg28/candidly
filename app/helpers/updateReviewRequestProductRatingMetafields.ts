
import db from '../db.server'
import createRatingCountMetafield from './metafields/createRatingCountMetafield';
import createRatingMetafield from './metafields/createRatingMetafield';
import deleteMetafield from "./metafields/deleteMetafield";
import updateRatingCountMetafield from './metafields/updateRatingCountMetafield';
import updateRatingMetafield from "./metafields/updateRatingMetafield";

export default async function updateReviewRequestProductRatingMetafields(productId: string, rating: number, shop: string) {
    try {   
        const productIdNumber = parseInt(productId.split('Product/')[1])

        const session = await db.session.findFirst({where: {shop: {equals: shop}}})

        if (!session) return
    
        const totalReviews = await db.productReview.findMany({where: {productId: {equals: productId}, AND: {store: {equals: session.shop}, AND: {isPublished: {equals: true}}}}})
        
        const url = `https://${shop}/admin/api/2024-07/products/${productIdNumber}/metafields.json`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'X-Shopify-Access-Token': session.accessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch metafields: ${response.statusText}`);
          }

        const data = await response.json();
        const metafields = data.metafields;
       
        // see if rating metafield exists
        const ratingMetafield = metafields.data.find((metafield: any) => metafield.owner_id === productIdNumber && metafield.key === 'rating')
    
        if (ratingMetafield) {
            // if it exists, that means rating count metafield also exists
            const ratingCountMetafield = metafields.data.find((metafield: any) => metafield.owner_id === productIdNumber && metafield.key === 'rating_count')
    
            if (totalReviews.length === 0) {
                await deleteMetafield(ratingCountMetafield.id, session.shop, session.accessToken)
                await deleteMetafield(ratingMetafield.id, session.shop, session.accessToken)
                return true
            }
    
            let totalReviewsScore = 0
            totalReviews.forEach(review => {
                totalReviewsScore += review.rating
            })
    
            const updatedAvgProductRating = (totalReviewsScore / totalReviews.length).toFixed(1)

            await updateRatingMetafield(ratingMetafield.id, updatedAvgProductRating, productIdNumber, session)
            await updateRatingCountMetafield(ratingMetafield.id, productIdNumber, totalReviews.length, session)
    
            return true
    
        } else {
    
            // initialize rating and rating count metafields since they do not already exist
            await createRatingMetafield(productIdNumber, rating, session)
            await createRatingCountMetafield(productIdNumber, totalReviews.length, session)
    
            return true
        }
    } catch (error) {
        console.log(error)
    }
}