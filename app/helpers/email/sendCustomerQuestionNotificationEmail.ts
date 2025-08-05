import { CustomerQuestion } from "@prisma/client"

import db from '../../db.server'
import SESClient from "~/utils/SESClient"

import { SendEmailCommand } from "@aws-sdk/client-ses"

export default async function sendCustomerQuestionNotificationEmail(customerQuestion: CustomerQuestion) {

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
                Data: "You have a new customer question!",
                Charset: 'UTF-8',
              },
            },
            Source: "customer-question@trycandidly.app"
          };
          try {
            const emailCommand = new SendEmailCommand(emailParams)
            await SESClient.send(emailCommand);
          } catch (err) {
            console.error('Error sending email:', err);
          }
    }
}