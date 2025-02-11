import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { ReviewRequestEmailData } from '~/types/types';
import generateEmailMarkup from './email/generateEmailMarkup';

export default async function sendEmail(emailBody: string, emailData: ReviewRequestEmailData, toAddress: string, fromAddress: string) {

    const emailMarkup = generateEmailMarkup(emailBody, emailData)

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
            Data: 'So...what do you think?!',
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