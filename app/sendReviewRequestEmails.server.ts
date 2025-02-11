import db from './db.server'

export default async function sendReviewRequestEmails() {
    const requestsToSendToday = await db.reviewRequest.findMany({where: {requestSentDate: {equals: new Date()}}})

    await Promise.all(requestsToSendToday.map(async (request) => {
        await fetch(`/api/reviewRequestEmail/${request.id}/send`, {method: 'POST'})

        const updatedData = {
            emailsSent: request.emailsSent + 1,
            requestSentDate: new Date(request.requestSentDate as any)
        }
        await db.reviewRequest.update({where: {id: request.id}, data: {emailsSent: request.emailsSent+1, }})
    }))
}