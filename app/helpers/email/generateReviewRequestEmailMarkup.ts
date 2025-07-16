import { ReviewRequestEmailData } from "~/types/types"
import generateReviewRequestEmailBody from "./generateReviewRequestEmailBody"

export default function generateReviewRequestEmailMarkup(emailBody: string, data: ReviewRequestEmailData) {

    const updatedEmailBody = generateReviewRequestEmailBody(emailBody, data)

    const completeMarkup = 
    `<div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="max-width: 600px; margin: auto; background-color: white; height: fit-content">
        <table style="background-color: ${data.bannerBgColor}; height: 70px; width: 100%">
            <tr>
            <td>
                ${data.logo ? `<img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src=${data.logo.url} alt="company-logo">` : ''}
            </td>
            </tr>
        </table>
        <div style="width: 90%; margin: auto; padding: 15px 0px;">
            <div style="text-align: center">
                ${updatedEmailBody}
            </div>
        </div>
        </div>
    </div>`  
    
    return completeMarkup
}