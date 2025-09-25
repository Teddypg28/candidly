import ResendClient from "~/utils/ResendClient";

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

      try {
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
                <strong>Title:</strong> ${title}
                <br />
                <br />
                <strong>Body:</strong> ${body}
                <br />
                <br />
                - ${storeName}
            </div>
        </div>`
    
        await ResendClient.emails.send({
          from: fromAddress,
          to: [ customerEmail ],
          subject: "We updated your review!",
          html: emailMarkup
        })
      } catch (error) {
        console.log("Error sending review edit notification email: ", error)
      }
}