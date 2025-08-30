import { SendEmailCommand } from "@aws-sdk/client-ses";
import SESClient from "~/utils/SESClient";

export default async function notifyCustomerReviewEdits({
    customerName, 
    customerEmail, 
    storeName, 
    title, 
    body,
    fromAddress
    }: 
    {
        customerName: string, 
        customerEmail: string, 
        storeName?: string, 
        title: string, 
        body: string,
        fromAddress: string
    }) {
    const emailMarkup = `
    <div style="padding: 15px 0px;">
        <div style="text-align: left">
            Hey ${customerName},
            <br />
            <br />
            We are just reaching out to let you know that we made  a small tweak to your review:
            <br />
            <br />
            Here is what the updated review looks like:
            <br />
            <br />
            <strong>Title: ${title}</strong>
            <br />
            <br />
            <strong>Body: ${body}</strong>
            <br />
            <br />
            - ${storeName}
        </div>
    </div>`

const emailParams = {
    Destination: {
      ToAddresses: [ customerEmail ],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: emailMarkup
        },
      },
      Subject: {
        Data: "We updated your review!",
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