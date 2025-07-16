export const generateCustomerQuestionAnswerEmailMarkup = (markupData: {title: string, answer: string, customerName: string, replyAddress: string, companyName: string}) => {
    const markup = 
    `<div style="padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="max-width: 600px; margin: auto; background-color: white; height: fit-content">
                <div>
                    Hey ${markupData.customerName},
                    <br />
                    <br />
                    You recently asked us the following question: <strong>${markupData.title}</strong>
                    <br />
                    <br />
                    Here's our answer for you: 
                    <br />
                    <br />
                    <strong>${markupData.answer}</strong>
                    <br />
                    <br />
                    We hope this answers your question! 
                    <br />
                    <br />
                    If you have any additional follow-up questions, please email us at ${markupData.replyAddress}.
                    <br />
                    <br />
                    Enjoy the rest of your day!
                    <br />
                    <br />
                    -${markupData.companyName}
                </div>
        </div>
    </div>`  

    return markup
}