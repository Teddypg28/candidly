import { SessionData } from "@remix-run/node"

import db from '../db.server'

export default async function importCsvFile(session: SessionData, data: FormData) {
        
    const file = data.get('reviews') as Blob
    const productId = data.get('productId')

    const text = await file.text()

    const cleanedData = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','))
    const headings = cleanedData.shift() as string[]

    const reviews = cleanedData.map(row => {
        const reviewsDbObject: any = {}
        row.forEach((column, index) => {

            if (headings[index] === 'date') {
                return reviewsDbObject[headings[index]] = new Date(column)
            }
            if (headings[index] === 'rating') {
                return reviewsDbObject[headings[index]] = parseInt(column)
            }
            reviewsDbObject[headings[index]] = column

        })
        reviewsDbObject['productId'] = productId
        reviewsDbObject['store'] = session.shop
        reviewsDbObject['isPublished'] = false
        return reviewsDbObject
    })

    await db.productReview.createMany({data: reviews})

} 
