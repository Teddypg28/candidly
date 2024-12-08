import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import db from '../db.server'

export async function loader({request, params} : LoaderFunctionArgs) {

    const { session } = await authenticate.public.appProxy(request)

    
    if (session && params.productId) {
        
        try {
            
            const totalReviews = await db.productReview.findMany({where: { store: {equals: session.shop}, productId: {equals: `gid://shopify/Product/${params.productId}`}, isPublished: {equals: true}}, include: {customQuestionAnswers: true, media: true}, omit: {productId: true}})
    
            const url = new URL(request.url)
            
            const pageParameter = url.searchParams.get('page')
            const limitParameter = url.searchParams.get('limit')

            const limit = limitParameter ? parseInt(limitParameter) : 5
            const page = pageParameter ? parseInt(pageParameter) : 1

            const startIndex = (page - 1) * limit
            const endIndex = page * limit
            const totalPages = Math.ceil(totalReviews.length/limit)

            const reviews = totalReviews.slice(startIndex, endIndex)

            const data = {
                page,
                limit,
                totalReviews: totalReviews.length,
                starDistribution: {
                    1: totalReviews.filter(review => review.rating === 1).length,
                    2: totalReviews.filter(review => review.rating === 2).length,
                    3: totalReviews.filter(review => review.rating === 3).length,
                    4: totalReviews.filter(review => review.rating === 4).length,
                    5: totalReviews.filter(review => review.rating === 5).length
                },
                totalPages,
                reviews
            }

            if (totalReviews) {
                return new Response(JSON.stringify(data), {status: 200})
            } else {
                return new Response('[]', {status: 200})
            }

        } catch (error) {

            console.log(error)

            return new Response(JSON.stringify(error), {status: 500})
            
        }

    }

}