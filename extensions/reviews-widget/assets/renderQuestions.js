const renderQuestions = () => {
    if (questionsWithAnswers.length > 0) {
        document.querySelector('#questions').innerHTML = `<div>There are some questions!</div>`
    } else {
        document.querySelector('#questions').innerHTML = `<div>There are no questions</div>`
    }
}