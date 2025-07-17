import { CustomerQuestionEmailVariables } from "~/types/types";

export default function generateCustomerQuestionEmailBody(emailBody: string, data: CustomerQuestionEmailVariables) {

    const dynamicVariableData: CustomerQuestionEmailVariables = {
        firstName: data.firstName,
        companyName: data.companyName,
        question: data.question,
        answer: data.answer
    }

    let updatedEmailBody = emailBody.replaceAll('\n', '<br />')

    updatedEmailBody = updatedEmailBody.replace(/{{(.*?)}}/g, (match, p1) => {
        return dynamicVariableData[p1 as keyof typeof dynamicVariableData] || match;
    });

    return updatedEmailBody

}