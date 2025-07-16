import sesClient from '~/utils/sesClient';
import { SendEmailCommand } from '@aws-sdk/client-ses'

export const sendCustomerQuestionAnswerEmail = async (subject: string, emailMarkup: string, toAddress: string, fromAddress: string) => {

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
            Data: subject,
            Charset: 'UTF-8',
          },
        },
        Source: fromAddress
      };
      try {
        const emailCommand = new SendEmailCommand(emailParams)
        await sesClient.send(emailCommand);
        return true
      } catch (err) {
        console.error('Error sending email:', err);
        return false
      }

}