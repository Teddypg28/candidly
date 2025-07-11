import { AdminApiContextWithRest } from 'node_modules/@shopify/shopify-app-remix/dist/ts/server/clients'
import db from '../db.server'
import { SessionParams } from 'node_modules/@shopify/shopify-api/dist/ts/lib/session/types'
import { startOfDay } from 'date-fns'
import { AnalyticsData } from '~/types/types'

const getProductName = async (productId: string, admin: AdminApiContextWithRest) => {
    const query = `
        query getProductName($id: ID!) {
            product(id: $id) {
            title
            }
        }
    `
    const result = await admin.graphql(query, {variables: {id: productId}})
    const data = await result.json()
    return data.data.product ? {title: data.data.product.title} : {title: 'Product Deleted'}
}

export default async function getAnalyticsData(session: SessionParams, admin: AdminApiContextWithRest, dateRange: string) {
    // initialize totalReviews object
    let totalReviews: {
        id: string;
        store: string;
        productId: string;
        title: string;
        body: string;
        firstName: string;
        email: string | null;
        rating: number;
        date: Date;
        isPublished: boolean;
    }[] = []
    // initalize date to today
    let date: Date = new Date()
    // read reviews depending on date range
    switch (dateRange) {
        case 'all':
            totalReviews = await db.productReview.findMany({where: {store: {equals: session.shop}}})
            break
        case 'today':
            break
        case 'month':
            const oneMonthAgoDate = new Date()
            oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1)
            date = oneMonthAgoDate
            break
        case 'sixMonths':
            const sixMonthsAgoDate = new Date()
            sixMonthsAgoDate.setMonth(sixMonthsAgoDate.getMonth() - 6)
            date = sixMonthsAgoDate
            break
        case 'year':
            const yearAgoDate = new Date()
            yearAgoDate.setMonth(yearAgoDate.getMonth() - 12)
            date = yearAgoDate
            break
    }      
        totalReviews = dateRange === 'all' ? totalReviews :  await db.productReview.findMany({where: {store: {equals: session.shop}, AND: {date: {gte: startOfDay(date)}}}})
        // read num of review request and num of review requests sent
        const totalReviewRequests = dateRange === 'all' ? await db.reviewRequest.findMany({where: {store: {equals: session.shop}}}) : await db.reviewRequest.findMany({where: {store: {equals: session.shop}, AND: {createdAt: {gte: startOfDay(date)}}}})
        const totalReviewRequestsSent = totalReviewRequests.reduce((accumulator, currentValue) => accumulator + currentValue.emailsSent, 0)
        // use reviews to get review data there are matching reviews for the provided date range
        if (totalReviews.length > 0) {
            let totalRatingValue = 0
            // calculate total rating value among all products
            totalReviews.forEach(review => {
                totalRatingValue += review.rating
            })
            // calculate avg product rating across all products
            const totalAvgProductRating = (totalRatingValue / totalReviews.length).toFixed(1)
            // find best and worst rated products
            // first find each unique product id that has been reviewed
            const reviewProductIds = totalReviews.map(review => review.productId)
            const filteredProductIds = reviewProductIds.filter((productId, index) => reviewProductIds.indexOf(productId) === index)
            // initialize array to hold product avgProductRating data for each product
            const avgProductRatings: {avgRating: number, productId: string}[] = []
            // loop through reviews, find matching ids, calculate avg rating for the product, push data object to array 
            filteredProductIds.map((id) => {
                let productRatingSum = 0
                const productReviews = totalReviews.filter(review => review.productId === id)
                productReviews.forEach(review => {
                    productRatingSum += review.rating
                })
                const avgRating = (productRatingSum/productReviews.length)
                avgProductRatings.push({avgRating, productId: id})
            })
            // read the product ids for the best and worst products
            const bestProductId = avgProductRatings.sort((a, b) => b.avgRating - a.avgRating)[0].productId
            const worstProductData = avgProductRatings.sort((a, b) => a.avgRating - b.avgRating)[0]
            const worstProductId = worstProductData.avgRating === 5 || totalReviews.length === 1 || bestProductId === worstProductData.productId ? null : worstProductData.productId 
            // use product ids and helper function to read the product names of the best/worst products
            const bestProductTitleHandle = await getProductName(bestProductId, admin)
            const worstProductTitleHandle = worstProductId ? await getProductName(worstProductId, admin) : null
            // create an array of objects with the data for each metric
            const analyticsData: AnalyticsData[] = [
                {heading: 'Total Reviews', value: totalReviews.length, key: 'totalReviews'},
                {heading: 'Average Product Rating', value: totalAvgProductRating, key: 'avgProductRating'},
                {heading: 'Best Rated Product', value: bestProductTitleHandle.title, link: `https://admin.shopify.com/store/powderedslopes/products/${bestProductId.split('Product/')[1]}`, key: 'bestProduct'},
                {heading: 'Worst Rated Product', value: worstProductTitleHandle?.title || '-', link: worstProductId ? `https://admin.shopify.com/store/powderedslopes/products/${worstProductData.productId.split('Product/')[1]}` : undefined, key: 'worstProduct'},
                {heading: 'Total Review Requests', value: totalReviewRequests.length, key: 'totalReviewRequests'},
                {heading: 'Total Review Requests Sent', value: totalReviewRequestsSent, key: 'totalReviewRequestsSent'}
            ]
            // return data
            return analyticsData
        }
        return [
            {heading: 'Total Reviews', value: totalReviews.length, key: 'totalReviews'},
            {heading: 'Average Product Rating', value: '-', key: 'avgProductRating'},
            {heading: 'Best Rated Product', value: '-', handle: null, key: 'bestProduct'},
            {heading: 'Worst Rated Product', value: '-', handle: null, key: 'worstProduct'},
            {heading: 'Total Review Requests', value: totalReviewRequests.length, key: 'totalReviewRequests'},
            {heading: 'Total Review Requests Sent', value: totalReviewRequestsSent, key: 'totalReviewRequestsSent'}
        ]
}