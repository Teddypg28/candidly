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
                `<svg class="reviewFormStar" data-rating="${i}" style="height: 30px; width: 30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#ffcd1a"></path> </g></svg>`
            )
        } else {
            htmlMarkup.push(
                `<svg class="reviewFormStar" data-rating="${i}" style="height: 30px; width: 30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#e6e6e6"></path> </g></svg>`
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
                    document.querySelector(`.star-${i}`).style.fill = '#ffcd1a'
                } else {
                    document.querySelector(`.star-${i}`).style.fill = '#e6e6e6'
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

