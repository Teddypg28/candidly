import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import db from '../../db.server'

export default async function sendReviewSubmittedNotificationEmail(reviewId: string) {

    const review = await db.productReview.findFirst({where: {id: {equals: reviewId}}})
    const storeSettings = await db.appSettings.findFirst({where: {store: {equals: review?.store}}})
    
    if (review && storeSettings) {
        const emailMarkup = `
        <div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
            <div style="max-width: 600px; margin: auto; background-color: white; height: fit-content">
                <table style="background-color: white; height: 70px; width: 100%">
                    <tr>
                    <td>
                       <img draggable="false" style="height: 50px; display: block; margin: auto" src="https://engines-episodes-t-packets.trycloudflare.com/logo.png" alt="company-logo">
                    </td>
                    </tr>
                </table>
                <div style="width: 90%; margin: auto; padding: 15px 0px;">
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
                    </div>
                </div>
            </div>
        </div>`

        const sesClient = new SESClient({
            region: process.env.AWS_REGION as string,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
            }
        })
    
        const emailParams = {
            Destination: {
              ToAddresses: [ storeSettings.primaryEmail ],
            },
            Message: {
              Body: {
                Html: {
                  Charset: 'UTF-8',
                  Data: emailMarkup
                },
              },
              Subject: {
                Data: "You have a new review!",
                Charset: 'UTF-8',
              },
            },
            Source: "new-review@trycandidly.app"
          };
          try {
            const emailCommand = new SendEmailCommand(emailParams)
            await sesClient.send(emailCommand);
          } catch (err) {
            console.error('Error sending email:', err);
          }
    }
}