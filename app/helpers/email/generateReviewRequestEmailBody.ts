import { ReviewRequestEmailVariables } from "~/types/types";

export default function generateReviewRequestEmailBody(emailBody: string, data: ReviewRequestEmailVariables) {

    let queryString = ''
    data.lineItems.forEach((lineItem, index) => {
        queryString += `productId${index+1}=${lineItem.productId.split('Product/')[1]}&productTitle${index+1}=${lineItem ? lineItem.title : ""}&productImage${index+1}=${lineItem.image || ''}&`
    })

    let questionQueryString = ''

    data.configuredQuestions.forEach((productQuestionSet, productIndex) => {
        questionQueryString += `numProduct${productIndex+1}Questions=${productQuestionSet.length}`
        productQuestionSet.forEach((questionId, questionIndex) => {
            questionQueryString += `&product${productIndex+1}Question${questionIndex+1}Id=${questionId}${questionIndex !== productQuestionSet.length - 1 || productIndex !== data.configuredQuestions.length - 1 ? '&' : ''}`
        }) 
    })
    queryString += questionQueryString

    // replace temporary app url
    const href = data.reviewRequestId ? `https://oz-dsl-tvs-sample.trycloudflare.com/review/form/${data.store?.split('.')[0]}/${data.reviewRequestId}/${data.authToken}${`?${queryString}`}` : '#'
    
    const dynamicVariableData: any = {
        firstName: data.firstName,
        productName: data.lineItems.length > 0 ? data.lineItems[0].title : "",
        stars: (
            `<div style="display: flex; justify-content: center; width: fit-content; gap: 5px; margin: 0px auto; padding: 0px">
                <a href="${href}&stars=1" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="1-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="1 star" />
                </a>
                <a href="${href}&stars=2" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}" id="2-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="2 stars" />
                </a>
                <a href="${href}&stars=3" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="3-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="3 stars" />
                </a>
                <a href="${href}&stars=4" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="4-star">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/BlackStar.PNG" style="height: 35px; width: 35px;" alt="4 stars" />
                </a>
                <a href="${href}&stars=5" style="font-size: 35px; text-decoration: none; pointer-events: ${data.reviewRequestId ? 'auto' : 'none'}"" id="5-star">
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

