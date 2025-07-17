import { CustomerQuestionEmailData, CustomerRewardEmailData, EmailHeaderStyles, ReviewRequestEmailData } from "~/types/types"
import generateReviewRequestEmailBody from "./generateReviewRequestEmailBody"
import generateCustomerQuestionEmailBody from "./generateCustomerQuestionEmailBody";
import generateCustomerRewardEmailBody from "./generateCustomerRewardEmailData";

export default function generateEmailMarkup(
    emailBody: string, 
    emailData: ReviewRequestEmailData | CustomerQuestionEmailData | CustomerRewardEmailData, 
    emailHeaderStyles: EmailHeaderStyles,
    type: "review-request" | "customer-question" | "customer-reward",
    ){

    let updatedEmailBody = ""
    switch (type) {
        case "review-request":
            updatedEmailBody = generateReviewRequestEmailBody(emailBody, emailData as ReviewRequestEmailData)
            break;
        case "customer-question":
            updatedEmailBody = generateCustomerQuestionEmailBody(emailBody, emailData as CustomerQuestionEmailData)
            break
        case "customer-reward":
            updatedEmailBody = generateCustomerRewardEmailBody(emailBody, emailData as CustomerRewardEmailData)
            break
        default:
            updatedEmailBody = ""
            break;
    }

    const completeMarkup = 
    `<div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="max-width: 600px; margin: auto; background-color: white; height: fit-content">
        <table style="background-color: ${emailHeaderStyles.bannerBgColor}; height: 70px; width: 100%">
            <tr>
            <td>
                ${emailHeaderStyles.logo ? `<img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src=${emailHeaderStyles.logo.url} alt="company-logo">` : ''}
            </td>
            </tr>
        </table>
        <div style="width: 90%; margin: auto; padding: 15px 0px;">
            <div style="text-align: left">
                ${updatedEmailBody}
            </div>
        </div>
        </div>
    </div>`  
    
    return completeMarkup
}