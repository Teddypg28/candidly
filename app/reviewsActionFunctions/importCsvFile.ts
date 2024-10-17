import { SessionData } from "@remix-run/node"

import db from '../db.server'

export default async function importCsvFile(session: SessionData, data: FormData) {

    try {
        
        const file = data.get('reviews') as Blob
        const productId = data.get('productId')
    
        const text = await file.text()
    
        const cleanedData = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','))
    
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
            reviewsObj['isPublished'] = false
    
            return reviewsObj
            
        })
    
        await db.productReview.createMany({data: reviews})

        return {success: true}

    } catch (error) {

        return {success: false}

    }

}