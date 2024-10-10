import { ActionFunctionArgs, json } from "@remix-run/node"

import scraperRouter from "../scrapers/scraperRouter";

import db from '../db.server'
import { authenticate } from "~/shopify.server";

export const action = async ({ request, params } : ActionFunctionArgs) => {
    
    const { session } = await authenticate.admin(request)

    if (params.type === 'third-party') {
        
        try {

            const data = await request.json()
 
            const reviews = await scraperRouter(data)
    
            console.log(reviews)
    
            return reviews
        
        } catch (error) {
    
            console.log(error)
            
            return json({message: 'There was an error while processing. Please double check your product link.'}, {"status": 400})
        
        }

    } else {

        try {

            const data = await request.formData()

            const file = data.get('reviews') as Blob
            const productId = data.get('productId')

            const text = await file.text()

            const cleanedData = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','))

            console.log(cleanedData)

            const headings: any = cleanedData.shift()

            const reviews = cleanedData.map(row => {

                const reviewsObj: any = {}

                row.forEach((data, index) => {

                    if (headings[index] === 'date') {

                        return reviewsObj[headings[index]] = new Date(data)

                    }

                    if (headings[index] === 'rating') {

                        return reviewsObj[headings[index]] = parseInt(data)

                    }

                    reviewsObj[headings[index]] = data

                })

                reviewsObj['productId'] = parseInt((productId as string).split('Product/')[1])
                reviewsObj['store'] = session.shop

                return reviewsObj
                
            })

            const newReviews = await db.productReview.createMany({data: reviews})

            return json(newReviews, {status: 200})
            
        } catch (error) {

            return json(error, {status: 400})
            
        }

    }
}
