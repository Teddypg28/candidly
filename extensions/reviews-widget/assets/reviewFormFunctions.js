// initialize global variables
let userRating = '5'
const userInputState = { title: '', body: '', firstName: '', email: '', rating: userRating, customQuestionAnswers: {} }
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

const handleFormSubmission = async (event) => {
    event.preventDefault()
    const errors = isFormErrors()
    if (errors.length > 0) {
        errors.forEach(error => {
            document.querySelector(`#${error.id}`).classList.remove('hidden')
        })
        userRating = '5'
    } else {
        const formData = new FormData(event.target)
        formData.delete('oseid')
        addedFiles.forEach(file => formData.append("media", file))
        formData.append('productId', `gid://shopify/Product/${reviewProductId}`)
        formData.append('rating', parseInt(userInputState.rating))
        formData.append('customQuestionAnswers', JSON.stringify(userInputState.customQuestionAnswers))
        await fetch(event.target.action, {method: 'POST', body: formData})
        window.location.reload()
    }
}

const closeReviewForm = () => {
    document.querySelector('.reviewFormOverlay').classList.add('hidden')
    document.body.style.overflow = 'scroll'
    userRating = '5'
}

const renderStars = (rating) => {
    const htmlMarkup = []
    for (let i = 1; i<6; i++) {
        if (i <= rating) {
            htmlMarkup.push(
                `<svg data-rating='${i}' class="reviewFormStar" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                    <path class="star-${i}" fill="${reviewSettings.primaryColor}" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                    l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                </svg>`
            )
        } else {
            htmlMarkup.push(
                `<svg data-rating='${i}' class="reviewFormStar star-" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                    <path class="star-${i}" fill="#e8e8e8" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                    l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                </svg>`
            )
        }
    }

    const reviewFormStarsContainer = document.querySelector('.reviewFormStarsContainer')
    reviewFormStarsContainer.innerHTML = htmlMarkup.join('')

    const reviewFormStars = document.querySelectorAll('.reviewFormStar')
    reviewFormStars.forEach(reviewFormStar => {
        const reviewFormStarRating = reviewFormStar.dataset.rating
        const fillStars = (maxRating) => {
            for (let i = 1; i<6; i++) {
                if (i<=maxRating) {
                    document.querySelector(`.star-${i}`).style.fill = reviewSettings.primaryColor
                } else {
                    document.querySelector(`.star-${i}`).style.fill = '#e8e8e8'
                }
            }
        }
        reviewFormStar.addEventListener('mouseover', () => fillStars(reviewFormStarRating))
        reviewFormStar.addEventListener('mouseleave', () => fillStars(rating))
        reviewFormStar.addEventListener('click', () => {
            const reviewFormStarRating = reviewFormStar.dataset.rating
            userRating = reviewFormStarRating
            userInputState['rating'] = userRating
            renderStars(reviewFormStarRating)
        })
    })
}

const insertCustomQuestion = (question) => {
    const customQuestionsContainer = document.querySelector('.customQuestionsContainer')
    let questionMarkup
    if (question.answerType[0] === 'text') {
        questionMarkup = `
            <div class='reviewFieldWrapper' style="width: 100%">
                <label for='customQuestion-${question.id}'>${question.title} ${question.isRequired[0] === "true" ? '*' : ''}</label>
                <textarea class='reviewFormInput reviewFormTextArea' data-name='customQuestion-${question.id}' id='customQuestion-${question.id}' placeholder="Enter your response here"></textarea>
                <p class='reviewFormValidationError hidden' id='customQuestion-${question.id}Error'>This field is required</p>
            </div>
        `
        customQuestionsContainer.innerHTML += questionMarkup
        userInputState['customQuestionAnswers'][`customQuestion-${question.id}`] = {value: '', type: 'text', isRequired: question.isRequired[0]}
    } else {
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
                            <i class="fa-solid fa-chevron-down" style="color: #ffffff;"></i> 
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
        userInputState['customQuestionAnswers'][`customQuestion-${question.id}`] = {value: [''], type: 'radio', isRequired: question.isRequired[0]}
    }
}

