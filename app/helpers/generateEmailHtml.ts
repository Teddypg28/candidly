import { EmailOrderData } from "~/types/types"

export default function generateEmailHtml(maxReward: string | null, customQuestions: any, emailOrderData: EmailOrderData) {
    const CustomQuestionMarkup = customQuestions.map((question: any) => {
        if (question.answerType[0] === 'text') {
          return `
            <div style="margin-top: 15px">
              <label style="font-weight: bold; font-size: 15px">${question.title}</label> <br />
              <textarea 
              style="resize: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; height: 100px; border: 1px solid lightgray; border-radius: 5px; font-size: 12px; box-sizing: border-box; padding: 10px; width: 100%; margin: auto; margin-top: 5px"
              ></textarea>
            </div>
          `
        }
        if (question.answerType[0] === 'radio') {
          if (question.radioAllowMultipleAnswers[0] === "false") {
            const SingleAnswerChoicesMarkup = question.radioAnswerChoices.map((choice: any) => {
              return `
                <div style="margin-bottom: 10px">
                  <input type="radio" id="answer-${choice.id}" name="question-${choice.questionId}" value="${choice.id}" />
                  <label for="answer-${choice.id}">${choice.value}</label>
                  <br />
                </div>
              `
            }).join('')
            return `
            <div style="margin-top: 15px">
              <label style="font-weight: bold; font-size: 15px">${question.title}</label> <br />
              <div style="margin-top: 5px">
                ${SingleAnswerChoicesMarkup}
              </div>
            </div>`
          } else {
            const MultipleAnswerChoicesMarkup = question.radioAnswerChoices.map((choice: any) => {
              return `
                <div style="margin-bottom: 10px">
                  <input type="checkbox" id="answer-${choice.id}" name="question-${choice.questionId}" value="${choice.id}" />
                  <label for="answer-${choice.id}">${choice.value}</label>
                  <br />
                </div>
              `
            }).join('')
            return `
            <div style="margin-top: 15px">
              <label style="font-weight: bold; font-size: 15px">${question.title}</label> <br />
              <div style="margin-top: 5px">
                ${MultipleAnswerChoicesMarkup}
              </div>
            </div>`
          }
        }
      }).join('')

    const EmailBodyMarkup = maxReward ? 
    `
        Hey ${emailOrderData.customerFirstName},
        <br />
        <br />
        We hope you’re absolutely loving your ${emailOrderData.productName}!
        <br />
        <br />
        We have a reward of up to ${maxReward} for you!
        <br />
        <br />
        Just simply fill out this review form and share your thoughts with us. It would mean the world to us!
        <br />
        <br />
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
    `
    :
    `
        Hey ${emailOrderData.customerFirstName},
        <br />
        <br />
        We hope you’re absolutely loving your ${emailOrderData.productName}!
        <br />
        <br />
        We’d love to hear your thoughts. If you could leave a quick review, it would mean a lot to us.
        <br />
        <br />
        Thanks a ton for being a part of our journey. We can’t wait to hear what you think!
        <br />
        <br />
    `
    return `
        <div style="background-color: rgb(248, 248, 248); padding: 10px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
        <div style="width: 40%; margin: auto; background-color: white; height: fit-content">
          <table style="background-color: black; height: 70px; width: 100%">
            <tr>
              <td>
              <img draggable="false" style="width: 50px; height: 50px; display: block; margin: auto" src="https://ratesphere.s3.us-east-2.amazonaws.com/1734304356052-timestamp-separator-blizzard-bites.png" alt="company-logo">
              </td>
            </tr>
          </table>
          <div style="width: 90%; margin: auto; padding: 15px 0px;">
            <div style="text-align: center">
              ${EmailBodyMarkup}
            </div>
            <div>
              <form style="width: 90%; margin: auto" action="http://127.0.0.1:5500/index.html">
                <label style="font-weight: bold; font-size: 15px">Rating:</label> <br />
                <table style="margin-bottom: 15px">
                  <tr>
                    <td style="padding-right: 15px">
                      <input type="radio" id="5-stars" name="rating" value="5" checked />
                      <label for="5-stars">★ ★ ★ ★ ★</label>
                    </td>
                    <td style="padding-right: 15px">
                      <input type="radio" id="4-stars" name="rating" value="4" />
                      <label for="4-stars">★ ★ ★ ★</label>
                    </td>
                    <td style="padding-right: 15px">
                      <input type="radio" id="3-stars" name="rating" value="3" />
                      <label for="3-stars">★ ★ ★</label>
                    </td>
                    <td style="padding-right: 15px">
                      <input type="radio" id="2-stars" name="rating" value="2" />
                      <label for="2-stars">★ ★</label>
                    </td>
                    <td>
                      <input type="radio" id="1-star" name="rating" value="1" />
                      <label for="1-star">★</label>
                    </td>
                  </tr>
                </table>
                <div style="margin-bottom: 15px;">
                  <label style="font-weight: bold; font-size: 15px;"> Headline: </label> <br />
                  <input 
                  name="headline"
                  style="border: 1px solid lightgray; border-radius: 5px; font-size: 12px; box-sizing: border-box; padding: 10px; width: 100%; margin: auto; margin-top: 5px" 
                  />    
                </div>
                <div>
                  <label style="font-weight: bold; font-size: 15px;"> Body: </label> <br />
                  <textarea 
                  name="body"
                  style="resize: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; height: 100px; border: 1px solid lightgray; border-radius: 5px; font-size: 12px; box-sizing: border-box; padding: 10px; width: 100%; margin: auto; margin-top: 5px" 
                  ></textarea>
                </div>
                ${CustomQuestionMarkup}
                <div style="width: fit-content; margin: auto; margin-top: 20px;">
                  <button type="submit" style="background-color: black; border: none; border-radius: 10px; color: white; padding: 12px 70px; font-weight: bold">Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`
}