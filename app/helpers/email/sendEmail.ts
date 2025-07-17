import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { CustomerQuestionEmailVariables, CustomerRewardEmailVariables, EmailHeaderStyles, ReviewRequestEmailVariables } from '~/types/types';
import generateEmailMarkup from './generateEmailMarkup';

export default async function sendEmail(
  emailSubject: string,
  emailBody: string, 
  emailVariables: ReviewRequestEmailVariables | CustomerQuestionEmailVariables | CustomerRewardEmailVariables, 
  emailHeaderStyles: EmailHeaderStyles,
  toAddress: string, 
  fromAddress: string,
  type: "review-request" | "customer-question" | "customer-reward"
  ) {

    const emailMarkup = generateEmailMarkup(emailBody, emailVariables, emailHeaderStyles, type)

    const sesClient = new SESClient({
        region: process.env.AWS_REGION as string,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        }
    })

    const emailParams = {
        Destination: {
          ToAddresses: [
            toAddress
          ],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: emailMarkup
            },
          },
          Subject: {
            Data: emailSubject.includes('{{firstName}}') && emailVariables.firstName ? emailSubject.replace('{{firstName}}', emailVariables.firstName) : emailSubject,
            Charset: 'UTF-8',
          },
        },
        Source: fromAddress
      };
      try {
        const emailCommand = new SendEmailCommand(emailParams)
        await sesClient.send(emailCommand);
      } catch (err) {
        console.error('Error sending email:', err);
      }
}