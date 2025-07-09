const submitReview = async () => {
    const formData = new FormData()
    for (const key in userInputState) {
        if (key === "customQuestionAnswers") {
            formData.append(key, JSON.stringify(userInputState[key]))
        } else {
            formData.append(key, userInputState[key])
        }
    }
    formData.append("media", addedFiles)
    formData.append("productId", `gid://shopify/Product/${reviewProductId}`)

    const res = await fetch(`https://${window.Shopify.shop}/apps/api/review/storefront/create`, {method: 'POST', body: formData})
    if (res.status === 200) {
        return true
    } else {
        return false
    }
}

const renderReviewForm = () => {

    const validateFormFields = () => {
        if (["title", "body", "firstName"].includes(steps[currentStep-1].key)) {
            const formInputValue = document.querySelector('.formQuestionInput').value
            if (formInputValue.trim() === "") {
                document.querySelector('.reviewFormValidationError').textContent = "This field is required"
                return true
            }
        } else if (steps[currentStep-1].key === "customQuestions") {
            let errors = false
            Object.keys(userInputState["customQuestionAnswers"]).forEach(key => {
                const questionId = key.split('customQuestion-')[1]
                document.querySelector(`#customQuestion-${questionId}Error`).classList.add('hidden')
                if (userInputState["customQuestionAnswers"][key].value[0] === '' && userInputState["customQuestionAnswers"][key].isRequired === "true") {
                    document.querySelector(`#customQuestion-${questionId}Error`).classList.remove('hidden')
                    errors = true
                }
            })
            if (errors) return true
        }
    }

    const renderStars = (rating) => {
        const htmlMarkup = []
        for (let i = 1; i<6; i++) {
            if (i <= rating) {
                htmlMarkup.push(
                    `<svg class="reviewFormStar" data-rating="${i}" style="height: 60px; width: 60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#ffcd1a"></path> </g></svg>`
                )
            } else {
                htmlMarkup.push(
                    `<svg class="reviewFormStar" data-rating="${i}" style="height: 60px; width: 60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="star-${i}" d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#e6e6e6"></path> </g></svg>`
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
                userInputState['rating'] = reviewFormStarRating
                renderStars(reviewFormStarRating)
                currentStep++
                renderReviewStep(steps[currentStep-1])
            })
        })
    }

    const steps = [
        {title: "How many stars would you give it?", markup: `<div class="reviewFormStarsContainer"></div>`, key: null}, 
        {title: "Give your review a title", markup: ` <input class='formQuestionInput' id='reviewHeadline' name='title' placeholder='Give your review a title' />`, key: 'title'}, 
        {title: "What did you like or not like?", markup: `<textarea class='formQuestionInput' name='body' id='reviewTextArea' placeholder='What would you tell your friends?'></textarea>`, key: 'body'},
        {title: 'Want to add an image or video?', markup: `
        <div class='uploadMediaContainer'>
            <label class='uploadMediaLabel' for='uploadMediaBtn'>
                <p class="uploadMediaText">Upload Media</p>
                <i class="fa-solid fa-upload"></i>
            </label>
            <div class='uploadedMediaContainer'></div>
            <input type='file' id='uploadMediaBtn' class='uploadMediaBtn' accept='image/png, image/jpg, image/jpeg, video/*' multiple />
        </div>
        <p class='uploadError'></p>`, key: 'media'}, 
        {title: 'What is Your First Name?', markup: `<input name="firstName" class="formQuestionInput" placeholder="Enter your first name" />`, key: 'firstName'}, 
    ]

    if (reviewSettings.customQuestions.length > 0) {
        steps.splice(3, 0, {title: "We are interested to know...", markup: `<div class="customQuestionsContainer"></div>`, key: 'customQuestions'})
    }

    const numSteps = steps.length
    let currentStep = 1
    
    // renders the steps helper at the bottom of the form
    const renderSteps = (numSteps) => {
        const markup = []
        for (let i = 1; i<=numSteps; i++) {
            markup.push(`<div class="reviewFormStep" style="background-color: ${i <= currentStep ? "black": "#f6f6f6"}"></div>`)
        }
        return markup.join("")
    }
    
    // show the question on the front end
    const renderReviewStep = (step) => {
        const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
        reviewFormOverlay.innerHTML = `
        <div class="writeReviewForm">
            <div class="closeModalBtnContainer" style="top: 5px; right: 10px">
                <svg class="closeModalBtn" style="height: 12px; width: 12px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="white"></path> </g></svg>
            </div>
            <svg class="writeReviewForwardBtn ${currentStep === 1 ? "hidden" : ""}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            <svg class="writeReviewBackBtn ${currentStep === 1 ? "hidden" : ""}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M6 12L11 7M6 12L11 17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            <h1 class="reviewFormStepTitle">${step.title}</h1>
            <div class="inputContainer">
                ${step.markup}
                <p class="reviewFormValidationError"></p>
            </div>
            <div class="stepsContainer">
                ${renderSteps(numSteps)}
            </div>
        </div>
        `

        // handle functionality based on current question being displayed
        if (currentStep === 1) {
            renderStars(userInputState["rating"])
        } else if (steps[currentStep-1].key === "media") {
            activateUploadMediaContainer()
        } else if (steps[currentStep-1].key === "customQuestions") {
            renderCustomQuestions()
        } else if (["title", "body", "firstName"].includes(steps[currentStep-1].key)) {
            const inputEl = document.querySelector('.formQuestionInput')
            inputEl.value = userInputState[inputEl.getAttribute("name")]
            document.querySelector('.formQuestionInput').addEventListener('input', handleUserInput)
        }

        // go back to the last question
        const lastQuestion = () => {
            currentStep--
            renderReviewStep(steps[currentStep-1])
        }
    
        // go to the next question
        const nextQuestion = async () => {
            // first, check if there are required questions unanswered
            const errors = validateFormFields()
            if (errors) return
            // if no errors, move to the next step, otherwise submit review and display thank you message
            if (currentStep < steps.length) {
                currentStep++
                renderReviewStep(steps[currentStep-1])
            } else {
                const submissionSuccessful = await submitReview()
                if (submissionSuccessful) {
                    const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
                    reviewFormOverlay.innerHTML = `
                    <div class="thankYouMessageContainer">
                        <div class="closeModalBtnContainer" style="right: 10px">
                            <svg class="closeModalBtn" style="height: 15px; width: 15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="white"></path> </g></svg>
                        </div>
                        <h1>Thank you, ${userInputState["firstName"]}!</h1>
                        <p>We hope to see you back soon!</p>
                        <svg viewBox="0 0 24 24" style="height: 60px; width: 60px" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.47963 6.8252C7.66038 7.50672 6.75075 7.84748 6.641 8.55405C6.53124 9.26062 7.29404 9.86506 8.81965 11.0739L9.21434 11.3867C9.64787 11.7302 9.86464 11.902 9.9889 12.1361C10.1132 12.3702 10.1309 12.6402 10.1662 13.1801L10.1984 13.6717C10.3229 15.5717 10.3852 16.5217 11.0438 16.8493C11.7024 17.1768 12.5212 16.6649 14.1588 15.6412L14.5825 15.3763C15.0479 15.0854 15.2805 14.9399 15.5467 14.8999C15.8128 14.86 16.0822 14.93 16.621 15.07L17.1116 15.1975C19.0078 15.6903 19.9559 15.9367 20.4727 15.4325C20.9895 14.9284 20.7328 14.0076 20.2193 12.166M20.6654 9.29403C21.7128 7.69854 22.2365 6.90079 21.8973 6.26168C21.5581 5.62258 20.5806 5.56537 18.6256 5.45095L18.1198 5.42135C17.5643 5.38884 17.2865 5.37259 17.0452 5.25261C16.804 5.13263 16.6265 4.9225 16.2716 4.50226L15.9486 4.11967C14.6997 2.64083 14.0753 1.90141 13.3488 2.01056C12.6224 2.11971 12.275 3.00516 11.5803 4.77604" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6.59527 8.55078C3.48192 10.6857 1.09828 14.7691 2.33125 21.9998C3.42268 18.9857 6.71261 16.5716 10.3877 15.4097" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>                    </div>
                    `
                    const closeFormBtn = document.querySelector('.closeModalBtnContainer')
                    closeFormBtn.addEventListener('click', closeReviewForm)
                } else {
                    document.querySelector('.askQuestionFormError').textContent = 'There was an error submitting this review'
                }
            }
        }
        
            document.querySelector('.writeReviewBackBtn').addEventListener('click', lastQuestion)
            document.querySelector('.writeReviewForwardBtn').addEventListener('click', nextQuestion)
            
            const closeFormBtn = document.querySelector('.closeModalBtnContainer')
            closeFormBtn.addEventListener('click', closeReviewForm)
        }

        const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
        reviewFormOverlay.classList.remove('hidden')
        renderReviewStep(steps[currentStep-1])
}