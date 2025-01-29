// initialize global variables
let userRating = '5'
const userInputState = { title: '', body: '', name: '', email: '', rating: userRating, customQuestionAnswers: {} }
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

const generateReviewFormMarkup = () => {
    const reviewFormOverlay = document.createElement('div')
    reviewFormOverlay.className = 'hidden reviewFormOverlay'
    const reviewFormMarkup = `
        <form class='reviewForm' action="https://blizzardbites.myshopify.com/apps/reviews/review/create" method="POST">
            <div class='closeReviewFormBtn'>x</div>
            <div class='reviewFormHeadingContainer'>
                <h1>${reviewSettings.formHeading}</h1>
                <h3>${reviewSettings.formSubheading}</h3>
                <div class='reviewFormStarsContainer'></div>
            </div>
            <div class='reviewFieldWrapper'>
                <label id='headlineLabel' for='reviewHeadline'> Give it a Headline * </label>
                <input class='reviewFormInput' id='reviewHeadline' name='title' placeholder='Sum up your experience in a few short words' />
                <p class='reviewFormValidationError hidden' id='titleError'>Headline is required</p>
            </div>
            <div class='reviewFieldWrapper'>
                <label id='bodyLabel' for='reviewTextArea'>Review *</label>
                <textarea class='reviewFormInput' name='body' id='reviewTextArea' placeholder='What did you like or not like?'></textarea>
                <p class='reviewFormValidationError hidden' id='bodyError'>Review is required</p>
            </div>
            <div class='customQuestionsContainer'></div>
            <div class='reviewNameEmailWrapper'>
                <div class='reviewNameEmailContainer'>
                    <label for='reviewerName'>Your First Name *</label>
                    <input class='reviewFormInput' type='name' name='name' id='reviewerName' />
                    <p class='reviewFormValidationError hidden' id='nameError'>Name is required</p>
                </div>
                <div class='reviewNameEmailContainer'>
                    <label for='reviewerEmail'>Your Email Address *</label>
                    <input class='reviewFormInput' type='email' name='email' id='reviewerEmail' />
                    <p class='reviewFormValidationError hidden' id='emailError'>Email is required</p>
                </div>
            </div>
            <div class='uploadMediaContainer'>
                <label class='uploadMediaLabel' for='uploadMediaBtn'>
                    <p>Upload Media</p>
                    <svg viewBox="0 0 1024 1024" class="uploadIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M220.5 245.4c-32.8 32.8-55.1 73.2-65.2 117.3h16.5c18.8-75.3 75.1-135.9 148-160.7v-16.9c-37.1 11.6-71 32-99.3 60.3z" fill="#ffffff"></path><path d="M959.9 540.8c0 113.6-92.1 205.8-205.7 205.9H590.9v-44h163.3c43.2 0 83.8-16.9 114.3-47.4 30.6-30.6 47.4-71.2 47.4-114.5 0-43.2-16.8-83.9-47.4-114.4S797.2 379 754 379c-11.5 0-22.8 1.2-33.8 3.5-15 3.2-29.4 8.4-42.8 15.7-1-15.4-3.3-30.7-6.8-45.6v-0.1c-3.6-15.6-8.6-30.8-14.9-45.7-14.4-33.9-34.9-64.4-61.1-90.6-26.2-26.2-56.6-46.7-90.6-61.1-35.1-14.8-72.4-22.4-110.9-22.4s-75.8 7.5-110.9 22.4c-33.9 14.3-64.4 34.9-90.6 61.1-26.2 26.2-46.7 56.7-61.1 90.6-14.9 35.1-22.4 72.4-22.4 110.9s7.5 75.8 22.4 110.9c14.3 33.9 34.9 64.4 61.1 90.6 26.2 26.2 56.7 46.7 90.6 61.1 35.1 14.8 72.4 22.4 110.9 22.4h39.7v44h-41C210.7 746 64.1 599 64.1 417.7c0-181.7 147.3-329 329-329 154.6 0 284.3 106.6 319.5 250.3v0.1c13.4-2.7 27.2-4.2 41.4-4.2 113.7 0.1 205.9 92.2 205.9 205.9z" fill="#39393A"></path><path d="M692.9 636.1h-22.6L519.8 485.6v449.6h-16V485.8L353.4 636.1h-22.6l181-181z" fill="#ffffff"></path></g></svg>            
                </label>
                <div class='uploadedMediaContainer'></div>
                <input type='file' id='uploadMediaBtn' class='uploadMediaBtn' accepts='image/*, video/*' multiple />
            </div>
            <p class='uploadError'></p>
            <button type="submit" class='submitReviewBtn' style='background-color: ${reviewSettings.primaryColor}'>Submit Review</button>
        </form>
    `
    document.body.appendChild(reviewFormOverlay)

    const writeReviewBtn = document.querySelector('.writeReviewBtn')

    writeReviewBtn.addEventListener('mouseover', () => {
        writeReviewBtn.style.backgroundColor = reviewSettings.primaryColor
        writeReviewBtn.style.borderColor = reviewSettings.primaryColor
        writeReviewBtn.style.color = 'white'
    })

    writeReviewBtn.addEventListener('mouseleave', () => {
        writeReviewBtn.style.backgroundColor = reviewSettings.backgroundColor
        writeReviewBtn.style.borderColor = 'black'
        writeReviewBtn.style.color = 'black'
    })

    writeReviewBtn.addEventListener('click', () => {
        const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
        reviewFormOverlay.innerHTML = reviewFormMarkup
        reviewFormOverlay.classList.remove('hidden')
        document.querySelector('.reviewForm').addEventListener('submit', handleFormSubmission)
        // insert custom questions
        if (reviewSettings.customQuestions.length > 0) {
            reviewSettings.customQuestions.forEach((question) => {
                insertCustomQuestion(question)
                const customQuestionDropdowns = document.querySelectorAll('.customQuestionDropdown')
                const customQuestionMultipleChoices = document.querySelectorAll('.multipleChoicesContainer')
                // add event listeners to single choice dropdowns
                customQuestionDropdowns.forEach(dropdown => {
                    dropdown.addEventListener('change', (e) => {
                        userInputState['customQuestionAnswers'][e.target.dataset.name] = {...userInputState['customQuestionAnswers'][e.target.dataset.name], value: [e.target.value]}
                    })
                })
                // add event listeners to multiple choise dropdowns
                if (customQuestionMultipleChoices.length > 0) {
                    customQuestionMultipleChoices.forEach(dropdown => {
                        const questionId = dropdown.id.split('-')[1]
                        const dropdownTop = document.querySelector(`#dropdownTop-${questionId}`)
                        const selectedOptionsContainer = document.querySelector(`#selectedOptionsContainer-${questionId}`)
                        const chevronContainer = document.querySelector(`#chevronContainer-${questionId}`)
                        let isDropdownOpen = false
                        dropdownTop.addEventListener('click', () => {
                            isDropdownOpen = !isDropdownOpen
                            const closeDropdown = (e) => {
                                if (e.target.classList.contains('checkbox') === false && e.target.classList.contains('dropdownItem') === false) {
                                    dropdownItemsContainer.classList.add('hidden')
                                    chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-down" style="color: #ffffff;"></i>'
                                    isDropdownOpen = false
                                    document.removeEventListener('click', closeDropdown)
                                }
                            }
                            const dropdownItemsContainer = document.querySelector(`#dropdownItemsContainer-${questionId}`)
                                if (dropdownItemsContainer.classList.contains('hidden')) {
                                dropdownItemsContainer.classList.remove('hidden')
                                chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-up" style="color: #ffffff;"></i>'                              
                            } else {                              
                                dropdownItemsContainer.classList.add('hidden')
                                chevronContainer.innerHTML = '<i class="fa-solid fa-chevron-down" style="color: #ffffff;"></i>'
                            }
                            if (isDropdownOpen) {
                                setTimeout(() => document.addEventListener('click', closeDropdown), 100)
                            }
                        })
                        document.querySelectorAll(`#dropdownQuestion${questionId}Item`).forEach(element => {
                            element.addEventListener('click', (e) => {
                                if (e.target.id === `dropdownQuestion${questionId}Item`) {
                                    if (e.target.children[0].classList.contains(`checked-${questionId}`)) {
                                        e.target.children[0].textContent = ' '
                                        e.target.children[0].classList.remove(`checked-${questionId}`)
                                    } else {
                                        e.target.children[0].textContent = '•'
                                        e.target.children[0].classList.add(`checked-${questionId}`)
                                    }
                                } else {
                                    if (e.target.classList.contains(`checked-${questionId}`)) {
                                        e.target.textContent = ' '
                                        e.target.classList.remove(`checked-${questionId}`)
                                    } else {
                                        e.target.textContent = '•'
                                        e.target.classList.add(`checked-${questionId}`)
                                    }
                                }
                                const checkedNames = []
                                const checkedAnswerIds = []
                                document.querySelectorAll(`.checked-${questionId}`).forEach(checkedElement => {
                                    checkedNames.push(checkedElement.dataset.name)
                                    checkedAnswerIds.push(checkedElement.dataset.id)
                                })
                                const selectedAnswers = checkedNames.join(', ')
                                if (checkedNames.length === 0) {
                                    selectedOptionsContainer.textContent = 'Select'                             
                                }
                                else {
                                    selectedOptionsContainer.textContent = selectedAnswers
                                }
                                userInputState['customQuestionAnswers'][`customQuestion-${questionId}`] = {...userInputState['customQuestionAnswers'][`customQuestion-${question.id}`], value: checkedAnswerIds.length > 0 ? checkedAnswerIds : ['']}
                            })
                        })
                    })
                }
            })
        }

        document.querySelectorAll('.reviewFormInput').forEach(input => {
            input.addEventListener('input', handleUserInput)
        })
        
        // add drag and drop functionality
        const uploadMediaContainer = document.querySelector('.uploadMediaContainer')
        const uploadedMediaContainer = document.querySelector('.uploadedMediaContainer')
        const uploadMediaBtn = document.querySelector('.uploadMediaBtn')
        const uploadError = document.querySelector('.uploadError')
        const verifyFileType = (file) => {
            if (file.type.split('/')[0] !== 'image' && file.type.split('/')[0] !== 'video') {
                return uploadError.innerText = 'Only image or video files are allowed'
            } 
            uploadError.innerText = ''
            // verify no duplicate files are being added -- uses array to verify since file list changes if multiple drag and drops are used
            if (!addedFiles.find(uploadedFile => uploadedFile.name === file.name)) {
                // push files to saved uploaded files array and update input element file list since file list changes if user drags and drops multiple sets of files
                addedFiles.push(file)
                const dt = new DataTransfer()
                addedFiles.forEach(file => {
                    dt.items.add(file)
                })
                uploadMediaBtn.files = dt.files
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onloadend = () => {
                    const imageContainer = document.createElement('figure')
                    imageContainer.className = 'uploadedImage'

                    const img = document.createElement('img')
                    img.src = reader.result

                    imageContainer.appendChild(img)
                    imageContainer.innerHTML += `<figcaption>${file.name}</figcaption>`

                    const removeUploadedMediaContainer = document.createElement('div')
                    removeUploadedMediaContainer.className = 'removeUploadedMediaContainer'
                    removeUploadedMediaContainer.id = 'removeUploadedMediaContainer deleteMedia'
                    removeUploadedMediaContainer.dataset.fileName = file.name

                    const trashCanIconContainer = document.createElement('div')
                    trashCanIconContainer.className = "removeUploadedMedia hidden"
                    trashCanIconContainer.dataset.fileName = file.name

                    const trashCanIcon = document.createElement('i')
                    trashCanIcon.className = "fa-solid fa-trash-can fa-2xl"
                    trashCanIcon.id = "deleteMedia"
                    trashCanIcon.dataset.fileName = file.name
                    trashCanIcon.style.color = "#ffffff"

                    trashCanIconContainer.appendChild(trashCanIcon)

                    removeUploadedMediaContainer.appendChild(trashCanIconContainer)

                    removeUploadedMediaContainer.addEventListener('mouseover', () => {                      
                        removeUploadedMediaContainer.style.backgroundColor = 'rgb(0, 0, 0, 0.6)'
                        trashCanIconContainer.classList.remove('hidden')
                    })

                    removeUploadedMediaContainer.addEventListener('mouseleave', () => {
                        removeUploadedMediaContainer.style.backgroundColor = 'transparent'
                        trashCanIconContainer.classList.add('hidden')
                    })

                    removeUploadedMediaContainer.addEventListener('click', (e) => {                     
                        if (e.target.id.includes('deleteMedia')) {
                            // remove deleted file from file list  
                            const dt = new DataTransfer()
                            const currentFiles = Array.from(uploadMediaBtn.files)
                            currentFiles.forEach(file => {
                                if (file.name !== e.target.dataset.fileName) {
                                    dt.items.add(file)
                                }
                            })
                            uploadMediaBtn.files = dt.files
                            // remove deleted files from saved uploaded files array
                            addedFiles = addedFiles.filter(uploadedFile => uploadedFile !== file)
                            imageContainer.remove()
                        }
                    })

                    imageContainer.appendChild(removeUploadedMediaContainer)
                    uploadedMediaContainer.appendChild(imageContainer)
                }
            }
        }

        const active = () => uploadMediaContainer.style.border = `2px dotted ${reviewSettings.primaryColor}`
        const inactive = () => uploadMediaContainer.style.border = '2px dotted lightgray'

        ['dragenter', 'dragover'].forEach(event => uploadMediaContainer.addEventListener(event, active));
        ['dragleave', 'drop'].forEach(event => uploadMediaContainer.addEventListener(event, inactive));

        uploadMediaBtn.addEventListener('change', () => {
            Array.from(uploadMediaBtn.files).forEach(verifyFileType)
        })

        // render initial stars
        renderStars(userRating)
        document.body.style.overflow = 'hidden'

        // close review form 
        const closeFormBtn = document.querySelector('.closeReviewFormBtn')
        closeFormBtn.addEventListener('click', closeReviewForm)
    })
}