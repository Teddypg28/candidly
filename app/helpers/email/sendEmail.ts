import { CustomerQuestionEmailVariables, CustomerRewardEmailVariables, EmailHeaderStyles, ReviewRequestEmailVariables } from '~/types/types';
import generateEmailMarkup from './generateEmailMarkup';

import ResendClient from '~/utils/ResendClient';

export default async function sendEmail(
  emailSubject: string,
  emailBody: string, 
  emailVariables: ReviewRequestEmailVariables | CustomerQuestionEmailVariables | CustomerRewardEmailVariables, 
  emailHeaderStyles: EmailHeaderStyles,
  toAddress: string, 
  fromAddress: string,
  type: "review-request" | "customer-question" | "customer-reward"
  ) {

    try {
      const emailMarkup = generateEmailMarkup(emailBody, emailVariables, emailHeaderStyles, type)
  
      await ResendClient.emails.send({
        from: fromAddress,
        to: [toAddress],
        subject: emailSubject.includes('{{firstName}}') && emailVariables.firstName ? emailSubject.replace('{{firstName}}', emailVariables.firstName) : emailSubject,
        html: emailMarkup
      })

    } catch (error) {
      console.error('Error sending email:', error);
    }
}