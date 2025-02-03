import { ReviewRequestEmailSettings } from "~/types/types"

export default function generateEmailTsx(type: 'Initial' | 'Follow Up', emailBody: string, settings: ReviewRequestEmailSettings) {

    const dynamicVariableData: any = {
        companyName: settings.companyName,
        stars: (
            `<div style="display: flex; justify-content: center; gap: 5px; margin: 25px auto; margin: 0px; padding: 0px">
                <a style="font-size: 35px; cursor: pointer;" id="1-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 40px; width: 40px;" alt="1 star" />
                </a>
                <a style="font-size: 35px; cursor: pointer;" id="2-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 40px; width: 40px;" alt="2 stars" />
                </a>
                <a style="font-size: 35px; cursor: pointer;" id="3-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 40px; width: 40px;" alt="3 stars" />
                </a>
                <a style="font-size: 35px; cursor: pointer;" id="4-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 40px; width: 40px;" alt="4 stars" />
                </a>
                <a style="font-size: 35px; cursor: pointer;" id="5-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 40px; width: 40px;" alt="5 stars" />
                </a>
            </div>`
        )
    }

    let updatedEmailBody = emailBody.replaceAll('\n', '<br />')

    updatedEmailBody = updatedEmailBody.replace(/{{(.*?)}}/g, (match, p1) => {
        return dynamicVariableData[p1] || match;
    });
    
    return updatedEmailBody
}