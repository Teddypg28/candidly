import db from './db.server'
import { AppSettings } from './types/types'

export default async function sendReviewRequestEmails() {
    const requestsToSendToday = await db.reviewRequest.findMany({where: {nextRequestDate: {equals: new Date().toLocaleDateString()}, AND: {reviewStatus: {equals: 'waiting'}}}})

    await Promise.all(requestsToSendToday.map(async (request) => {

        await fetch(`https://sunset-bearing-investigators-allied.trycloudflare.com/api/reviewRequestEmail/${request.id}/send`, {method: 'POST', body: JSON.stringify({store: request.store})})

        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: request.store}}}) as AppSettings

        const generateNextDate = () => {
            // returns the next review request date using the second review request number of days setting
            const nextRequestDate = new Date(request.nextRequestDate as any)
            nextRequestDate.setDate(nextRequestDate.getDate() + storeSettings.secondReviewRequest)
            return nextRequestDate.toLocaleDateString()
        }

        const updatedData = {
            emailsSent: request.emailsSent + 1,
            nextRequestDate: request.emailsSent === 0 ? generateNextDate() : null
        }
        await db.reviewRequest.update({where: {id: request.id}, data: updatedData})

    }))
}