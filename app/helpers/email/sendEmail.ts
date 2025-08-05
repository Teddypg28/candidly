import { SendEmailCommand } from '@aws-sdk/client-ses'
import { CustomerQuestionEmailVariables, CustomerRewardEmailVariables, EmailHeaderStyles, ReviewRequestEmailVariables } from '~/types/types';
import generateEmailMarkup from './generateEmailMarkup';

import SESClient from '~/utils/SESClient';

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
        await SESClient.send(emailCommand);
      } catch (err) {
        console.error('Error sending email:', err);
      }
}