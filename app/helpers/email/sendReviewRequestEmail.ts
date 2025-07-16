import { SendEmailCommand } from '@aws-sdk/client-ses'
import { ReviewRequestEmailData } from '~/types/types';

import generateReviewRequestEmailMarkup from './generateReviewRequestEmailMarkup';

import sesClient from '~/utils/sesClient';

export default async function sendReviewRequestEmail(emailBody: string, emailData: ReviewRequestEmailData, toAddress: string, fromAddress: string) {

    const emailMarkup = generateReviewRequestEmailMarkup(emailBody, emailData)

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
            Data: emailData.subject,
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