import { CustomerQuestion } from "@prisma/client"

import db from '../../db.server'
import ResendClient from "~/utils/ResendClient"

export default async function sendCustomerQuestionNotificationEmail(customerQuestion: CustomerQuestion) {

  try {
    const storeSettings = await db.appSettings.findFirst({where: {store: {equals: customerQuestion.store}}})
  
    if (storeSettings) {
        const emailMarkup = `
        <div style="padding: 15px 0px;">
            <div style="text-align: left">
                Hey ${storeSettings?.companyName || ""},
                <br />
                <br />
                ${customerQuestion.firstName} just submitted a question:
                <br />
                <br />
                <strong>${customerQuestion.title}</strong>
                <br />
                <br />
                - Candidly App
            </div>
        </div>`

        await ResendClient.emails.send({
          from: 'customer-question@trycandidly.app',
          to: [ storeSettings.primaryEmail ],
          subject: "You have a new customer question!",
          html: emailMarkup
        })
    }
  } catch (error) {
    console.log("Error sending customer question notification email: ", error)
  }
}