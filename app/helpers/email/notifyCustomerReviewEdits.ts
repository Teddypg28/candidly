import { SendEmailCommand } from "@aws-sdk/client-ses";
import SESClient from "~/utils/SESClient";

export default async function notifyCustomerReviewEdits({
    customerName, 
    customerEmail, 
    storeName, 
    title, 
    body,
    fromAddress,
    mediaEdited
    }: 
    {
        customerName: string, 
        customerEmail: string, 
        storeName?: string, 
        title: string, 
        body: string,
        fromAddress: string,
        mediaEdited: null | "both" | "added" | "removed"
    }) {

      const mediaEditMessage = mediaEdited === null ? "" : mediaEdited === "both" ? " and added/removed some of the media attachments." : mediaEdited === "added" ?
      " and added some more media attachments." : " and removed some media attachments."

    const emailMarkup = `
    <div style="padding: 15px 0px;">
        <div style="text-align: left">
            Hey ${customerName},
            <br />
            <br />
            We are just reaching out to let you know that we made  a small tweak to your review${mediaEdited !== null ? mediaEditMessage : '.'}
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