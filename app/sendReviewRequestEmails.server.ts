import generateReviewRequestHash from './auth/generateReviewRequestHash.server'
import db from './db.server'
import { AppSettings } from './types/types'

export default async function sendReviewRequestEmails() {
    const requestsToSendToday = await db.reviewRequest.findMany({where: {nextRequestDate: {equals: new Date()}, AND: {reviewStatus: {equals: 'pending'}}}})

    await Promise.all(requestsToSendToday.map(async (request) => {

        // generate auth token if it doesn't exist yet
        if (!request.authToken) {
            const token = await generateReviewRequestHash()
            await db.reviewRequest.update({where: {id: request.id}, data: {authToken: token}})
        }

        await fetch(`/api/reviewRequestEmail/${request.id}/send`, {method: 'POST'})

        const storeSettings = await db.appSettings.findFirst({where: {store: {equals: request.store}}}) as AppSettings

        const generateNextDate = () => {
            // set the next review request date
            const nextRequestDate = new Date(request.nextRequestDate as any)
            nextRequestDate.setDate(nextRequestDate.getDate() + storeSettings.secondReviewRequest)
            return nextRequestDate
        }

        const updatedData = {
            emailsSent: request.emailsSent + 1,
            nextRequestDate: request.emailsSent === 0 ? generateNextDate() : null
        }
        await db.reviewRequest.update({where: {id: request.id}, data: updatedData})
    }))
}