import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { CustomerQuestionEmailData, CustomerRewardEmailData, EmailHeaderStyles, ReviewRequestEmailData } from '~/types/types';
import generateEmailMarkup from './generateEmailMarkup';

export default async function sendEmail(
  emailBody: string, 
  emailData: ReviewRequestEmailData | CustomerQuestionEmailData | CustomerRewardEmailData, 
  emailHeaderStyles: EmailHeaderStyles,
  toAddress: string, 
  fromAddress: string,
  type: "review-request" | "customer-question" | "customer-reward"
  ) {

    const emailMarkup = generateEmailMarkup(emailBody, emailData, emailHeaderStyles, type)

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
            Data: emailData.subject.includes('{{firstName}}') && emailData.firstName ? emailData.subject.replace('{{firstName}}', emailData.firstName) : emailData.subject,
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