import { ReviewRequestEmailData } from "~/types/types";

export default function generateEmailBody(emailBody: string, data: ReviewRequestEmailData) {

    let queryString = ''
    data.lineItems.forEach((lineItem, index) => {
        queryString += `productId${index+1}=${lineItem.productId}&productTitle${index+1}=${lineItem.productName}&productImage${index+1}=${lineItem.productImage}${index !== data.lineItems.length - 1 && '&'}`
    })
    queryString += `&numProductIds=${data.lineItems.length}&`

    let questionQueryString = ''
    data.configuredQuestions.forEach((productQuestionSet, productIndex) => {
        productQuestionSet.forEach((questionId, questionIndex) => {
            questionQueryString += `numProduct${productIndex+1}Questions=${productQuestionSet.length}&product${productIndex+1}question${questionIndex+1}Id=${questionId}${questionIndex !== productQuestionSet.length - 1 || productIndex !== data.configuredQuestions.length - 1 && '&'}`
        }) 
    })
    queryString += questionQueryString

    // replace temporary app url
    const href = data.reviewRequestId ? `https://indicate-foul-cheat-sell.trycloudflare.com/review/form/${data.store}/${data.reviewRequestId}/${data.authToken}${`?${queryString}`}` : '#'
    
    const dynamicVariableData: any = {
        firstName: data.firstName,
        companyName: data.companyName,
        productName: '',
        maxReward: data.maxReward?.toLowerCase(),
        stars: (
            `<div style="display: flex; justify-content: center; width: fit-content; gap: 5px; margin: 0px auto; padding: 0px">
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="1-star">
                    <img src="${href}&stars=1" style="height: 35px; width: 35px;" alt="1 star" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="2-star">
                    <img src="${href}&stars=2" style="height: 35px; width: 35px;" alt="2 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="3-star">
                    <img src="${href}&stars=3" style="height: 35px; width: 35px;" alt="3 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="4-star">
                    <img src="${href}&stars=4" style="height: 35px; width: 35px;" alt="4 stars" />
                </a>
                <a href="${href}" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="5-star">
                    <img src="${href}&stars=5" style="height: 35px; width: 35px;" alt="5 stars" />
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

