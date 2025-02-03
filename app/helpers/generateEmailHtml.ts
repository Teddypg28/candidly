import { EmailCompanyData, EmailOrderData } from "~/types/types"

export default function generateEmailHtml(emailType: "initial" | "follow-up", maxReward: string | null, emailCompanyData: EmailCompanyData,  emailOrderData: EmailOrderData) {

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
        <div style="width: fit-content; margin: 15px auto; padding: 0px">
          <a href="https://example.com/rating?star=1" style="font-size: 35px; cursor: pointer; text-decoration: none" id="1-star">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" height="40px" width="40px" />
          </a>
          <a href="https://example.com/rating?star=2" style="font-size: 35px; cursor: pointer; text-decoration: none" id="2-star">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" height="40px" width="40px" />
          </a>
          <a href="https://example.com/rating?star=3" style="font-size: 35px; cursor: pointer; text-decoration: none" id="3-star">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" height="40px" width="40px" />
          </a>
          <a href="https://example.com/rating?star=4" style="font-size: 35px; cursor: pointer; text-decoration: none" id="4-star">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" height="40px" width="40px" />
          </a>
          <a href="https://example.com/rating?star=5" style="font-size: 35px; cursor: pointer; text-decoration: none" id="5-star">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" height="40px" width="40px" />
          </a>
        </div>
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
        - ${emailCompanyData.name}
    `
    return `
        <div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="width: 60%; margin: auto; background-color: white; height: fit-content">
          <table style="background-color: black; height: 70px; width: 100%">
            <tr>
              <td>
                <img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src=${emailCompanyData.logo} alt="company-logo">
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