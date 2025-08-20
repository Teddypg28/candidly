import { SessionData } from "@remix-run/node"

import db from '../db.server'

const randomString = () => {
    const values = []
    const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y","Z"]
    for (let i = 0; i<5; i++) {
        values.push(alphabet[Math.floor(Math.random() * alphabet.length)])
        values.push(Math.floor(Math.random() * 10))
    }
    return values.join('')
}

export default async function importCsvFile(session: SessionData, data: FormData) {
    const file = data.get('reviews') as Blob

    const productId = data.get('productId')
    const text = await file.text()

    // replace all carriage returns with empty strings, split where there is a new line and separate each item with an array
    const cleanedData = text.trim().replaceAll('\r', '').split('\n').map(row => row.split(','))
    const headings = cleanedData.shift() as string[]
    const reviews = cleanedData.map(row => {
        const reviewsDbObject: any = {}
        const mediaUrls: string[] = row.filter(val => val.includes('https://'))
        const rowWithoutMedia = row.filter(rowVal => !rowVal.includes('https://')).filter(val => val !== "")
        rowWithoutMedia.forEach((column, index) => {
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
        reviewsDbObject['media'] = mediaUrls
        return reviewsDbObject
    })

    await Promise.all(reviews.map(async (review) => {
        const media = review.media
        delete review["media"]
        
        const newReview = await db.productReview.create({data: review})
        if (media.length > 0 && media[0] !== '') {
            await Promise.all(media.map(async (url: string) => {
                console.log(url)
                await db.productReviewMedia.create({data: {reviewId: newReview.id, name: `${randomString()}-media-upload`, url}})
            }))
        }
    }))
} 
