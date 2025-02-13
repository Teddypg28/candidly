import { ReviewRequestEmailData } from "~/types/types";

export default function generateEmailBody(emailBody: string, data: ReviewRequestEmailData) {

    // replace temporary app url
    const href = data.reviewRequestId ? `https://concluded-sa-homepage-athletes.trycloudflare.com/review/form/${data.store}/${data.reviewRequestId}` : '#'
    
    const dynamicVariableData: any = {
        firstName: data.firstName,
        companyName: data.companyName,
        productName: '',
        maxReward: data.maxReward,
        stars: (
            `<div style="display: flex; justify-content: center; width: fit-content; gap: 5px; margin: 0px auto; padding: 0px">
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="1-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="1 star" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="2-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="2 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="3-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="3 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="4-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="4 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="5-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="5 stars" />
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

