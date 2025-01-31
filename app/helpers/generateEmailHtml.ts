import { EmailOrderData } from "~/types/types"

export default function generateEmailHtml(emailType: "initial" | "follow-up", companyName: string, maxReward: string | null, emailOrderData: EmailOrderData) {

    const EmailBodyMarkup = maxReward ? 
    `
        Hey ${emailOrderData.customerFirstName},
        <br />
        <br />
        We hope you’re absolutely loving your ${emailOrderData.productName}!
        <br />
        <br />
        We have a reward of up to ${maxReward} for you!
        <br />
        <br />
        Just simply fill out this review form and share your thoughts with us. It would mean the world to us!
        <br />
        <br />
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
    `
    :
    `
        Hey ${emailOrderData.customerFirstName},
        <br />
        <br />
        We hope you’re absolutely loving your ${emailOrderData.productName}!
        <br />
        <br />
        We’d love to hear your thoughts. If you could leave a quick review, it would mean a lot to us.
        <br />
        <br />
        <br />
        <br />
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
    `
    return `
        <div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="width: 40%; margin: auto; background-color: white; height: fit-content">
          <table style="background-color: black; height: 70px; width: 100%">
            <tr>
              <td>
              <img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src="https://ratesphere.s3.us-east-2.amazonaws.com/1734304356052-timestamp-separator-blizzard-bites.png" alt="company-logo">
              </td>
            </tr>
          </table>
          <div style="width: 90%; margin: auto; padding: 15px 0px;">
            <div style="text-align: center">
              ${EmailBodyMarkup}
            </div>
          </div>
        </div>
      </div>`
}