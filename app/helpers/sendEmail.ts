import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import generateEmailHtml from './generateEmailHtml';

export default async function sendEmail(html: string, toAddress: string, fromAddress: string) {

    /*

    1) at 6:00 pm EST, search db for review request records with send date matching current date
    2) check if rewards exist
    3) if rewards exist:
        - generate rewards email html
       else:
        - generate no rewards email html
    4) send email

    */

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
              Data: html
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