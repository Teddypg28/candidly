import { CustomerRewardEmailData } from "~/types/types";

export default function generateCustomerRewardEmailBody(emailBody: string, data: CustomerRewardEmailData) {

    const dynamicVariableData: any = {
        firstName: data.firstName,
        companyName: data.companyName,
        discountCode: data.discountCode,
        reward: data.reward
    }

    let updatedEmailBody = emailBody.replaceAll('\n', '<br />')

    updatedEmailBody = updatedEmailBody.replace(/{{(.*?)}}/g, (match, p1) => {
        return dynamicVariableData[p1] || match;
    });

    return updatedEmailBody

}