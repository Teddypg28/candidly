import db from '../../db.server'
import ResendClient from "~/utils/ResendClient";

export default async function sendReviewSubmittedNotificationEmail(reviewId: string) {
  try {
    const review = await db.productReview.findFirst({where: {id: {equals: reviewId}}})
    const storeSettings = await db.appSettings.findFirst({where: {store: {equals: review?.store}}})
    
    if (review && storeSettings) {
        const emailMarkup = `
        <div style="padding: 15px 0px;">
            <div style="text-align: left">
                Hey ${storeSettings.companyName},
                <br />
                <br />
                You just earned a <strong>${review.rating} star review</strong> from ${review.firstName}:
                <br />
                <br />
                <strong>Title:</strong> "${review.title}"
                <br />
                <br />
                <strong>Body:</strong> "${review.body}"
                <br />
                <br />
                - Candidly App
            </div>
        </div>`
      
        await ResendClient.emails.send({
          from: 'new-review@trycandidly.app',
          to: [ storeSettings.primaryEmail ],
          subject: "You have a new review!",
          html: emailMarkup
        })
    }
  } catch (error) {
    console.log("Failed to send review submitted notification email: ", error)
  }
}