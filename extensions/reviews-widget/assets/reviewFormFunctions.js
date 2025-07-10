// initialize global variables
let userRating = '5'
let userInputState = { title: '', body: '', firstName: '', rating: userRating, customQuestionAnswers: {} }
let addedFiles = []

const handleUserInput = (event) => {
    if (event.target.dataset.name && event.target.dataset.name.includes('customQuestion')) {
        userInputState['customQuestionAnswers'][event.target.dataset.name] = {...userInputState['customQuestionAnswers'][event.target.dataset.name], value: event.target.value}
    } else {
        userInputState[event.target.name] = event.target.value
    } 
}

const clearErrors = () => {
    const formErrorElements = document.querySelectorAll('.reviewFormValidationError')
    formErrorElements.forEach(element => element.classList.add('hidden'))
}

const isFormErrors = () => {
    clearErrors()
    let errors = []
    const userInputStateCopy = {...userInputState}
    const inputKeys = Object.keys(userInputStateCopy)
    for (let i = 0; i<inputKeys.length; i++) {
        if (inputKeys[i] === 'customQuestionAnswers') {  
            Object.keys(userInputStateCopy['customQuestionAnswers']).forEach(key => { 
                if (userInputStateCopy['customQuestionAnswers'][key].type === 'text'){
                    if (userInputStateCopy['customQuestionAnswers'][key].value.trim() === '' && userInputStateCopy['customQuestionAnswers'][key].isRequired === 'true') {
                        errors.push({id: `${key}Error`})
                    }
                } else if (userInputStateCopy['customQuestionAnswers'][key].type === 'radio') {
                    if (userInputStateCopy['customQuestionAnswers'][key].value[0] === '' && userInputStateCopy['customQuestionAnswers'][key].isRequired === 'true') {
                        errors.push({id: `${key}Error`})
                    }
                }              
            })
        } else if (userInputStateCopy[inputKeys[i]].trim() === '') { 
            errors.push({id: `${inputKeys[i]}Error`})
        }
    }
    return errors
}


const closeReviewForm = () => {
    document.querySelector('.reviewFormOverlay').classList.add('hidden')
    document.body.style.overflow = 'scroll'
    userInputState['rating'] = 5
}

const insertCustomQuestion = (question) => {
    const customQuestionsContainer = document.querySelector('.customQuestionsContainer')

    let questionMarkup
    questionMarkup = `<div style="display: flex; flex-direction: column" class='customQuestion-${question.id} customQuestionRadio'></div>`          
    customQuestionsContainer.innerHTML += questionMarkup
    const questionMarkupContainer = document.querySelector(`.customQuestion-${question.id}`)
    if (question.radioAllowMultipleAnswers[0] === 'true') {
        const renderChoices = () => {
            return question.radioAnswerChoices.map((choice, index) => {
                return (
                        `<div key=${index} class="dropdownItem" id="dropdownQuestion${question.id}Item">
                            ${choice.value}
                            <div class="checkbox" data-name="${choice.value}" data-id="${choice.id}"> </div>
                        </div>`
                )
        }).join('')}
        questionMarkupContainer.innerHTML+= `
            <label for='multipleChoicesContainer-${question.id}' class='customQuestionTitle'>${question.title} ${question.isRequired[0] === "true" ? '*' : ''}</label>
            <div id='multipleChoicesContainer-${question.id}' class="multipleChoicesContainer">
                <div class="dropdownTop" id="dropdownTop-${question.id}">
                    <p class="selectedOptionsContainer" id="selectedOptionsContainer-${question.id}">Select</p>
                    <span class="chevronContainer" id='chevronContainer-${question.id}'> 
                        <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> 
                    </span>
                </div>
                <div class="dropdownItemsContainer hidden" id="dropdownItemsContainer-${question.id}">
                    ${renderChoices()}
                </div>
            </div>
            <p class='reviewFormValidationError hidden' id='customQuestion-${question.id}Error'>This field is required</p>`                  
    } else {
        questionMarkupContainer.innerHTML+= `
            <label for='answerChoicesContainer-${question.id}' class='customQuestionTitle'>${question.title} ${question.isRequired[0] === "true" ? '*' : ''}</label>
            <select data-name="customQuestion-${question.id}" class='customQuestionDropdown' id='answerChoicesContainer-${question.id}'>
                <option value="">Select one</option>
            </select>
            <p class='reviewFormValidationError hidden' id='customQuestion-${question.id}Error'>This field is required</p>
        `
        const answerChoicesContainer = document.getElementById(`answerChoicesContainer-${question.id}`)
        question.radioAnswerChoices.forEach((choice) => {
            answerChoicesContainer.innerHTML += `<option value="${choice.id}">${choice.value}</option>`
        })
    }

    if (!userInputState["customQuestionAnswers"][`customQuestion-${question.id}`]) {
        userInputState['customQuestionAnswers'][`customQuestion-${question.id}`] = {value: [''], type: 'radio', isRequired: question.isRequired[0]}
    }
}

