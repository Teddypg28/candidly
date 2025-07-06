// returns the date of the review in a string format
const getDate = (reviewDate) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const date = new Date(reviewDate)
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// uses the user rating to generate stars for the review display
const generateStars = (stars) => {
    let starMarkup = []
    const emptyStars = 5 - stars
    for (let i = 0; i<stars; i++) {
        starMarkup.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32">
                            <defs>
                            <linearGradient id="fullStar-${i}">
                                <stop offset="50%" stop-color="${reviewSettings.primaryColor}"/>
                                <stop offset="50%" stop-color="${reviewSettings.primaryColor}"/>
                            </linearGradient>
                            </defs>
                            <path fill="url(#fullStar-${i})" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                            l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                        </svg>`)
    }
    for (let i = 0; i<emptyStars; i++) {
        starMarkup.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32">
                            <defs>
                            <linearGradient id="emptyStar-${i}">
                                <stop offset="50%" stop-color="#e8e8e8"/>
                                <stop offset="50%" stop-color="#e8e8e8"/>
                            </linearGradient>
                            </defs>
                            <path fill="url(#emptyStar-${i})" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                            l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                        </svg>`)
    }
    return starMarkup.join('')
}

const renderMediaCarousel = (index, src) => {

    document.body.style.overflow = 'hidden'
    // render the rest of the images apart of the review
    const allImages = reviewData.reviews[index].media.map((media, index) => {
        const border = media.url === src ? '1px solid lightgray' : '1px solid rgb(243, 243, 243)'
        return media.url.includes('mp4') || media.url.includes('mov') ? 
        `<video src="${media.url}" data-key=${index} class="mediaItem" style="border: ${border}"> 
            <source src="${media.url}" />
        </video>` 
        : 
        `<img data-key=${index} class="mediaItem" src="${media.url}" style="border: ${border}"  />`
    }).join('')
    // extract url value from each media object
    const mediaUrls = reviewData.reviews[index].media.map(mediaObj => mediaObj.url)
    // find the index of the current url
    const currentMediaItemIndex = mediaUrls.indexOf(src)
    // render markup
    const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
    reviewFormOverlay.innerHTML = `
        <div class="mediaCarouselContainer">
            <svg class="backwardCarouselArrow" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_92_" d="M111.213,165.004L250.607,25.607c5.858-5.858,5.858-15.355,0-21.213c-5.858-5.858-15.355-5.858-21.213,0.001 l-150,150.004C76.58,157.211,75,161.026,75,165.004c0,3.979,1.581,7.794,4.394,10.607l150,149.996 C232.322,328.536,236.161,330,240,330s7.678-1.464,10.607-4.394c5.858-5.858,5.858-15.355,0-21.213L111.213,165.004z"></path> </g></svg>
            <div class="mediaCarouselCardContainer">
                <svg class="closeMediaCarouselBtn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#000000"></path> </g></svg>
                <div class="mediaCarouselCardDataContainer">
                    ${src.includes('mp4') || src.includes('mov') ? 
                    `<video src="${src}" class="currentCarouselItem" controls>
                        <source src="${src}" preload="auto" />
                    </video>
                    ` 
                    : 
                    `<img draggable="false" class="currentCarouselItem" src="${src}" />`}
                    <div class="mediaCarouselReviewDetails"> 
                        <div class='reviewerName' style="color: ${reviewSettings.primaryColor}; margin-bottom: 5px">${reviewData.reviews[index].firstName}</div>
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px">
                            <div class="generatedStars">${generateStars(reviewData.reviews[index].rating)}</div>
                            <p style="margin: 0px; padding: 0px">${getDate(new Date(reviewData.reviews[index].date))}</p>
                        </div>
                        <h2 class='reviewHeading' style="margin: 0; padding: 0">${reviewData.reviews[index].title}</h2>
                        <p class='carouselReviewBody'>${reviewData.reviews[index].body}</p>
                    </div>
                </div>
                <div class="allMediaContainer">${allImages}</div>
            </div>                     
            <svg class="forwardCarouselArrow" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"></path> </g></svg>                          
        </div>
    `
    reviewFormOverlay.classList.remove('hidden')

    const forwardCarouselArrow = document.querySelector('.forwardCarouselArrow')
    const backwardCarouselArrow = document.querySelector('.backwardCarouselArrow')
    const closeMediaCarouselBtn = document.querySelector('.closeMediaCarouselBtn')
    // attach click listener to media items so that user can navigate to the respective image upon click
    document.querySelectorAll('.mediaItem').forEach(mediaItem => {
        mediaItem.addEventListener('click', () => {
            const indexOfMediaItem = parseInt(mediaItem.dataset.key)
            renderMediaCarousel(index, reviewData.reviews[index].media[indexOfMediaItem].url)
        })
    })
    // close media carousel button
    closeMediaCarouselBtn.addEventListener('click', () => {
        document.body.style.overflow = ''
        reviewFormOverlay.classList.add('hidden')
    })
    // if more images left to show, add event listener to forward arrow and brighten arrow color
    if (currentMediaItemIndex < mediaUrls.length - 1) {
        forwardCarouselArrow.style.fill = '#ffffff'
        forwardCarouselArrow.style.cursor = 'pointer'
        forwardCarouselArrow.addEventListener('click', () => {
            const nextMediaItemUrl = reviewData.reviews[index].media[currentMediaItemIndex+1].url
            // render next media image
            renderMediaCarousel(index, nextMediaItemUrl)
    })
    // else, do not add event listener and dim arrow color
    } else {
        forwardCarouselArrow.style.fill = '#cccccc'
        forwardCarouselArrow.style.cursor = 'cursor'
    }
    // if no images left to show, do not add event listener and dim arrow color
    if (currentMediaItemIndex === 0) {
        backwardCarouselArrow.style.fill = '#cccccc'
        backwardCarouselArrow.style.cursor = 'cursor'
    } else {
        // else, add event listener to backwards arrow and brighten arrow color
        backwardCarouselArrow.style.fill = '#ffffff'
        backwardCarouselArrow.style.cursor = 'pointer'
        backwardCarouselArrow.addEventListener('click', () => {
            const prevMediaItemUrl = reviewData.reviews[index].media[currentMediaItemIndex-1].url
            // render prev media image
            renderMediaCarousel(index, prevMediaItemUrl)
        })
    }
}

const generateReviewStatsMarkup = () => {
    const reviewStatsMarkup = []
    for (let i = 5; i>0; i--) {
        const numMatchingStarReviews = reviewData.starDistribution[i]
        const fillWidth = numMatchingStarReviews / reviewData.totalReviews * 100
        reviewStatsMarkup.push(
            `<div class='reviewBarContainer'>
                <p class='star'>${i}</p>
                <div>★</div>
                <div class='outerFillContainer'>
                    <div class='innerFillContainer' style="width: ${fillWidth}%; background-color: ${reviewSettings.primaryColor}"> </div>
                </div>
                <p class='numMatchingStarReviews'>${numMatchingStarReviews}</p>
            </div>`
        )
    }
    return reviewStatsMarkup.join('')
}

const generateCustomQuestionAnswerMarkup = (review) => {
    if (review.radioQuestionResponses.length > 0) {
        const answerData = {}
        review.radioQuestionResponses.forEach(radioQuestionResponse => {
            console.log(answerData, radioQuestionResponse)
            if (Object.keys(answerData).includes(radioQuestionResponse.label)) {
                answerData[radioQuestionResponse.label] = {...answerData[radioQuestionResponse.label], answers: [answerData[radioQuestionResponse.label].answers, radioQuestionResponse.value]}
            } else {
                answerData[radioQuestionResponse.label] = {display: radioQuestionResponse.display, answers: [radioQuestionResponse.value]}
            }
        })
        const answers = Object.keys(answerData).map((label) => {
            if (answerData[label].display === true) {
                return `<div> <strong>${label}:</strong> ${answerData[label].answers.join(', ')}</div>`
            }
            return ''
        })
        if (!answers.includes('')) {
            if (window.screen.width <= 400) {
                return answers.join('')
            }
            return answers.join('|')
        }
    }
    return ''
}

// renders the reviews for a given page
const setCurrentPage = (currentPage, currentSortBy) => {

    const numOfPages = reviewData.totalPages

    const reviewMarkup = reviewData.reviews.map((review, index) => {

        return (
            `<div class='reviewContainer' key=${index}>
                <p>${getDate(new Date(review.date))}</p>
                <div class='ratingNameContainer'>
                    <div class='generatedStars'>${generateStars(review.rating)}</div>
                    <div class='reviewerName' style="color: ${reviewSettings.primaryColor}">${review.firstName}</div>
                </div>
                <h3 class='reviewHeading'>${review.title}</h3>
                <div class='reviewBody'>${review.body}</div>
            </div>

            ${review.radioQuestionResponses.length > 0 ? `<div class='reviewAnswerDisplayContainer'>${generateCustomQuestionAnswerMarkup(review)}</div>` : ''}

            ${review.media.length > 0 ?
            `<div class="reviewMediaContainer">
                ${review.media.map((mediaItem, index) => {     
                return mediaItem.url.includes('mp4') || mediaItem.url.includes('mov') ? 
                    `
                        <video src="${mediaItem.url}" key=${index} class="reviewMediaItem">
                            <source src="${mediaItem.url}" />
                        </video>
                    
                    ` : 
                    
                    `<img key=${index} class="reviewMediaItem" src="${mediaItem.url}" />`

                }).join('')}
            </div>` : ''}

            ${index !== reviewData.reviews.length - 1 && reviewData.reviews.length > 1 ?
            "<div class='separator'> </div>" : generatePaginator(currentPage, numOfPages)}`
        )
    })

    const startIndex = (currentPage - 1) * reviewData.limit + 1
    const endIndex = reviewData.totalPages === currentPage ? reviewData.totalReviews : currentPage * reviewData.limit

    document.getElementById('reviews').innerHTML = reviewMarkup.join('')
    document.getElementById('reviewCount').textContent = `${startIndex}-${endIndex} of ${reviewData.totalReviews} ${reviewData.totalReviews === 1 ? 'Review' : 'Reviews'}`

    // add event listeners for whenever review media item is clicked
    document.querySelectorAll('.reviewMediaItem').forEach(el => {
        el.addEventListener('click', () => {
            const reviewIndex = reviewData.reviews.findIndex(review => {
                const reviewMediaLinks = review.media.map(media => media.url)
                return reviewMediaLinks.includes(el.src)
            })
            renderMediaCarousel(reviewIndex, el.src)
        })
    })

    const prevPageBtn = document.querySelector('.paginatorPrev')
    const nextPageBtn = document.querySelector('.paginatorNext')

    if (currentPage === 1) {
        prevPageBtn.style.color = 'lightgray'
        prevPageBtn.style.cursor = 'not-allowed'
        prevPageBtn.disabled = true
    }

    if (currentPage === numOfPages) {
        nextPageBtn.style.color = 'lightgray'
        nextPageBtn.style.cursor = 'not-allowed'
        nextPageBtn.disabled = true
    }

    nextPageBtn.addEventListener('click', () => {
        if (currentPage + 1 <= numOfPages) {
            fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=${currentPage+1}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)
                .then(() => setCurrentPage(currentPage + 1, currentSortBy))
        }
    })

    prevPageBtn.addEventListener('click', () => {
        if (currentPage - 1 !== 0) {
            fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=${currentPage-1}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => setCurrentPage(currentPage - 1, currentSortBy))
        }
    })

    const paginatorNumbers = document.querySelectorAll('.paginatorNumber')
    paginatorNumbers.forEach(el => {
        el.addEventListener('click', () => {
            fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=${parseInt(el.dataset.page)}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => setCurrentPage(parseInt(el.dataset.page), currentSortBy))
        })
        if (el.dataset.page === currentPage.toString()) {
            return el.classList.add('selected')
        }
    })
}

// renders review metadata and calls function to render the corresponding reviews - or displays "no reviews" message

const renderReviews = () => {
    document.querySelector('.mainReviewContainer').innerHTML = `
            <div class='reviewWidgetHeader'>
                <div class='headingBtnContainer'>
                    <h1 class='heading'>Customer Reviews</h1>
                    <div class='writeReviewBtn'>Write Review</div>
                </div>
                <p class='noReviewsText'>Be the first to write a review!</p>
            </div>
            <div class='hasReviewsWrapper hidden'>
                <div class='reviewStatsWrapper'>
                    <div class='reviewStatsContainer'>
                        <p class="avgCustomerRatingText">Average Customer Rating</p>
                        <h1 id='averageCustomerReviewScore'></h1>
                        <p id='totalCustomerReviews'></p>
                    </div>
                    <div class='reviewStatsContainer'>
                        <div id='reviewBarWrapper'></div>
                    </div>
                </div>
                <div class='reviewsQuestionsContainer'>
                    <div class='showReviewsBtn'>Reviews (${reviewData.totalReviews})</div>
                    <div class='showQuestionsBtn'>Questions (${questionsWithAnswers.length})</div>
                </div>
                <div class='reviewsQuestionsContainerSeparator'> </div>
                <div class='flexContainer'>
                    <p id='reviewCount'></p>
                    <div class='sortByContainer'>
                        <div class='chevronIconContainer'></div>
                        <div class='sortByItemsContainer hidden'>
                            <div class='sortByItem' id='Newest'>Newest</div>
                            <div class='sortByItem' id='Oldest'>Oldest</div>
                            <div class='sortByItem' id='Highest'>Highest</div>
                            <div class='sortByItem' id='Lowest'>Lowest</div>
                        </div>
                    </div>
                </div>
                <div id='reviews'></div>
                <div id='questions'></div>
            </div>
        `
        const reviewFormOverlay = document.createElement('div')
        reviewFormOverlay.className = 'hidden reviewFormOverlay'
        const reviewFormMarkup = `
            <form class='reviewForm' action="https://powderedslopes.myshopify.com/apps/api/review/storefront/create" method="POST">
                <div class='closeReviewFormBtn'>x</div>
                <div class='reviewFormHeadingContainer'>
                    <h1>${reviewSettings.formHeading}</h1>
                    <p class='reviewFormSubheading'>${reviewSettings.formSubheading}</p>
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
                        <input class='reviewFormInput' type='name' name='firstName' id='reviewerName' />
                        <p class='reviewFormValidationError hidden' id='firstNameError'>Name is required</p>
                    </div>
                    <div class='reviewNameEmailContainer'>
                        <label for='reviewerEmail'>Your Email Address *</label>
                        <input class='reviewFormInput' type='email' name='email' id='reviewerEmail' />
                        <p class='reviewFormValidationError hidden' id='emailError'>Email is required</p>
                    </div>
                </div>
                <div class='uploadMediaContainer'>
                    <label class='uploadMediaLabel' for='uploadMediaBtn'>
                        <p class="uploadMediaText">Upload Media</p>
                        <i class="fa-solid fa-upload"></i>
                    </label>
                    <div class='uploadedMediaContainer'></div>
                    <input type='file' id='uploadMediaBtn' class='uploadMediaBtn' accept='image/png, image/jpg, image/jpeg, video/*' multiple />
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

        let areFilterOptionsVisible = false
        let currentSortBy = 'Newest'

        const chevronIconContainer = document.querySelector('.chevronIconContainer')
        const sortByItemsContainer = document.querySelector('.sortByItemsContainer')

        chevronIconContainer.innerHTML = `Sort by: <strong>${currentSortBy}</strong> &nbsp; <i id='down' class="fa-solid fa-chevron-down fa-xs"></i>`

        const filterItems = Array.from(document.querySelectorAll('.sortByItem'))

        const closeSortByOptions = () => {
            areFilterOptionsVisible = false
            sortByItemsContainer.classList.add('hidden')
            chevronIconContainer.innerHTML = `Sort by: <strong>${currentSortBy}</strong> &nbsp; <i id='down' class="fa-solid fa-chevron-down fa-xs"></i>`
        }  

        const setCheckedFilter = (filterItems) => {
            filterItems.forEach(item => {
                item.textContent = item.id
            })
            const highlightedFilterItem = filterItems.find(item => {
                return item.id.toLowerCase() === currentSortBy.toLowerCase()
            })
            highlightedFilterItem.innerHTML += `<i class="check-icon fa-solid fa-check fa-xs" style="color: #000000;"></i>`
        }

        setCheckedFilter(filterItems)

        filterItems.forEach(item => {
            item.addEventListener('click', () => {          
                currentSortBy = item.id
                closeSortByOptions()
                setCheckedFilter(filterItems)
                if (currentSortBy === 'Lowest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=lowest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                } 
                if (currentSortBy === 'Highest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=highest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                }
                if (currentSortBy === 'Oldest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=oldest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                }
                if (currentSortBy === 'Newest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=newest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                }
            })
        })

        chevronIconContainer.addEventListener('click', () => {
            if (!areFilterOptionsVisible) {
                const closeSortByOptionsListenerFunction = () => {
                    closeSortByOptions()
                    document.removeEventListener('click', closeSortByOptionsListenerFunction)
                }
                setTimeout(() => {
                    document.addEventListener('click', closeSortByOptionsListenerFunction)
                }, 100)
                areFilterOptionsVisible = true
                sortByItemsContainer.classList.remove('hidden')
                chevronIconContainer.innerHTML = `Sort by: <strong>${currentSortBy}</strong> &nbsp; <i id='down' class="fa-solid fa-chevron-up fa-xs"></i>`
            } else {
                closeSortByOptions()
            }
        })

        document.getElementById('reviewBarWrapper').innerHTML = generateReviewStatsMarkup()
        document.getElementById('averageCustomerReviewScore').textContent = `${avgRating.toFixed(1)} out of 5`
        document.getElementById('totalCustomerReviews').textContent = `${reviewData.totalReviews} customer ${reviewData.totalReviews > 1 ? 'reviews' : 'review'}`

        // this function will then render the actual reviews, starting at page 1
        setCurrentPage(1, 'Newest')

        document.querySelector('.showReviewsBtn').style.fontWeight = 'bold'
        document.querySelector('.showReviewsBtn').style.borderBottom = '2px solid black'

        document.querySelector('.showQuestionsBtn').addEventListener('click', () => {
            document.querySelector('#reviews').classList.add('hidden')
            document.querySelector('#questions').classList.remove('hidden')
            document.querySelector('.flexContainer').classList.add('hidden')
            document.querySelector('.showQuestionsBtn').style.fontWeight = 'bold'
            document.querySelector('.showQuestionsBtn').style.borderBottom = '2px solid black'
            document.querySelector('.showReviewsBtn').style.fontWeight = 'normal'
            document.querySelector('.showReviewsBtn').style.borderBottom = 'none'
        })

        document.querySelector('.showReviewsBtn').addEventListener('click', () => {
            document.querySelector('#reviews').classList.remove('hidden')
            document.querySelector('#questions').classList.add('hidden')
            document.querySelector('.flexContainer').classList.remove('hidden')
            document.querySelector('.showQuestionsBtn').style.fontWeight = 'normal'
            document.querySelector('.showQuestionsBtn').style.borderBottom = 'none'
            document.querySelector('.showReviewsBtn').style.fontWeight = 'bold'
            document.querySelector('.showReviewsBtn').style.borderBottom = '2px solid black'
        })
}

