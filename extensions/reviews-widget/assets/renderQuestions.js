const renderQuestions = () => {
    if (questionsWithAnswers.length > 0) {
        const questionMarkup = []
        questionsWithAnswers.forEach(question => {
            questionMarkup.push(`
                <div>
                    <p class="questionFirstName">${question.firstName}</p>
                    <h1 class="customerQuestionTitle">${question.title}</h1>
                    ${question.answer && 
                    `<div class="questionAnswerContainer">
                        <p></p>
                        <p>${question.answer.body}</p>
                        <p class="companyName">${companyName}</p>
                    </div>`
                    }
                </div>
            `)
        })
        document.querySelector('#questions').innerHTML = `<div class="questionMarkupContainer">${questionMarkup.join('')}</div>`
    } else {
        document.querySelector('#questions').innerHTML = `<div>There are no questions yet. Be the first to ask one!</div>`
    }  
}
