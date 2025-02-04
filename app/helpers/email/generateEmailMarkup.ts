import { ReviewRequestEmailSettings } from "~/types/types"
import generateEmailBody from "./generateEmailBody"

export default function generateEmailMarkup(emailBody: string, settings: ReviewRequestEmailSettings) {

    const updatedEmailBody = generateEmailBody(emailBody, settings)

    const completeMarkup = 
    `<div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="width: 60%; margin: auto; background-color: white; height: fit-content">
        <table style="background-color: ${settings.bannerBgColor}; height: 70px; width: 100%">
            <tr>
            <td>
                <img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src=${settings.logo?.url} alt="company-logo">
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