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
        starMarkup.push(`<svg style="height: 20px; width: 20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#ffcd1a"></path> </g></svg>`)
    }
    for (let i = 0; i<emptyStars; i++) {
        starMarkup.push(`<svg style="height: 20px; width: 20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="#e6e6e6"></path> </g></svg>`)
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
                <div class="closeModalBtnContainer">
                    <svg class="closeModalBtn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="white"></path> </g></svg>
                </div>
                <div class="flex">
                    <div class="mediaCarouselCardDataContainer">
                        ${src.includes('mp4') || src.includes('mov') ? 
                        `<video src="${src}" class="currentCarouselItem" controls>
                            <source src="${src}" preload="auto" />
                        </video>
                        ` 
                        : 
                        `<img draggable="false" class="currentCarouselItem" src="${src}" />`}
                    </div>
                    <div class="mediaCarouselReviewDetails"> 
                        <div class="reviewDetails">
                        <p style="margin: 0px; padding: 0px">${getDate(new Date(reviewData.reviews[index].date))}</p>
                            <div style="display: flex; align-items: center; gap: 15px; margin: 20px 0px">
                                <div class="generatedStars">${generateStars(reviewData.reviews[index].rating)}</div>
                                <div class='reviewerName'>${reviewData.reviews[index].firstName}</div>
                            </div>
                            <h2 class='reviewHeading' style="margin: 0; padding: 0">${reviewData.reviews[index].title}</h2>
                            <p class='carouselReviewBody'>${reviewData.reviews[index].body}</p>
                        </div>
                        <div class="allMediaContainer">${allImages}</div>
                    </div>
                </div>
            </div>                     
            <svg class="forwardCarouselArrow" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"></path> </g></svg>                          
        </div>
    `
    reviewFormOverlay.classList.remove('hidden')

    const forwardCarouselArrow = document.querySelector('.forwardCarouselArrow')
    const backwardCarouselArrow = document.querySelector('.backwardCarouselArrow')
    const closeMediaCarouselBtn = document.querySelector('.closeMediaCarouselBtnContainer')
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
                <svg style="height: 17px; width: 17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="black"></path> </g></svg>
                <div class='outerFillContainer'>
                    <div class='innerFillContainer' style="width: ${fillWidth}%"> </div>
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
                    <div class='reviewerName'>${review.firstName}</div>
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
                    <div class='btnContainer'>
                        <div class='writeReviewBtn hoverEffect'>Write Review</div>
                        <div class='askQuestionBtn hoverEffect'>Ask Question</div>
                    </div>
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
                <div id='questions' class='hidden'></div>
            </div>
        `
        const reviewFormOverlay = document.createElement('div')
        reviewFormOverlay.className = 'hidden reviewFormOverlay'
        document.body.appendChild(reviewFormOverlay)

        const reviewFormMarkup = `
            <form class='reviewForm' action="https://${window.Shopify.shop}/apps/api/review/storefront/create" method="POST">
                <div class='closeFormBtn'>x</div>
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
                <button type="submit" class='submitReviewBtn'>Submit Review</button>
            </form>
        `

        const writeReviewBtn = document.querySelector('.writeReviewBtn')
        const askQuestionBtn = document.querySelector('.askQuestionBtn')

        askQuestionBtn.addEventListener('click', () => {
            
            let askQuestionFormData = {title: "", firstName: "", email: "", productId: reviewProductId}

            const steps = [
                {title: 'Ask Us a Question!', input: `<textarea data-questionkey="title" class="askQuestionInput" placeholder="Enter your question here"></textarea>`}, 
                {title: 'What is Your First Name?', input: `<input data-questionkey="firstName" class="askQuestionInput" placeholder="Enter your first name" />`}, 
                {title: 'Where Should We Reply?', input: `<input data-questionkey="email" class="askQuestionInput" placeholder="Enter your email address" />`}
            ]
            const numSteps = steps.length
            let currentStep = 1

            const renderSteps = (numSteps) => {
                const markup = []
                for (let i = 1; i<=numSteps; i++) {
                    markup.push(`<div class="step" style="background-color: ${i <= currentStep ? "black": "#f6f6f6"}"></div>`)
                }
                return markup.join("")
            }

            const lastQuestion = () => {
                currentStep--
                renderQuestion(steps[currentStep-1])
            }

            const nextQuestion = async () => {

                const questionInput = document.querySelector('.askQuestionInput')
                if (questionInput.value.trim() === "") {
                    return document.querySelector('.askQuestionFormError').textContent = 'This field is required'
                }
                if (questionInput.dataset.questionkey === "email" && (!questionInput.value.includes('@') || !questionInput.value.includes('.'))) {
                    return document.querySelector('.askQuestionFormError').textContent = 'Please enter a valid email address'
                }

                askQuestionFormData[questionInput.dataset.questionkey] = questionInput.value

                if (currentStep < steps.length) {
                    currentStep++
                    renderQuestion(steps[currentStep-1])
                } else {
                    const submissionSuccessful = submitQuestion()
                    if (submissionSuccessful) {
                        const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
                        reviewFormOverlay.innerHTML = `
                        <div class="thankYouMessageContainer">
                            <div class="closeModalBtnContainer" style="right: 10px">
                                <svg class="closeModalBtn" style="height: 15px; width: 15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="white"></path> </g></svg>
                            </div>
                            <h1>Thanks for asking, ${askQuestionFormData["firstName"]}!</h1>
                            <p>We'll get back to you soon!</p>
                            <svg height="60px" width="60px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css">  .st0{fill:#006eb3;}  </style> <g> <path class="st0" d="M512,216.906c-0.031-29.313-23.781-53.078-53.094-53.094h-75.891c-3.531,0-43.578,0-47.219,0 c-6.953,0.063-13.328,1.094-17.969,1.031c-1.859,0-3.328-0.156-4.188-0.344L313,164.313l-0.156-0.469 c-0.141-0.609-0.281-1.625-0.281-3.094c0-0.906,0.141-2.188,0.25-3.438l30.281-74.875c2.906-7.188,4.281-14.656,4.281-21.969 c0.031-23.188-13.844-45.156-36.656-54.406c-7.156-2.891-14.641-4.281-21.984-4.281c-23.203-0.016-45.141,13.875-54.391,36.672 l-0.047,0.078l-51.359,129.313h0.031c-3.438,8.063-6.203,15.625-8.906,22.156c-4.078,10.031-8.063,17.25-12.766,21.438 c-2.359,2.125-4.922,3.719-8.484,4.969c-3.531,1.219-8.172,2.047-14.391,2.047c-3.781-0.016-7.375,0.422-10.891,1.078H44.5 c-24.594,0-44.5,19.922-44.5,44.5v201.703c0,24.578,19.906,44.484,44.5,44.484h61.578c13.641,0,24.719-11.063,24.719-24.719 v-20.484c4.328,2.531,8.891,4.828,13.797,6.672c17.156,6.5,37.531,9.219,62.063,9.219h191.25c29.313,0,53.094-23.719,53.094-53.047 c0-6.891-1.406-13.453-3.828-19.453c21.156-7,36.453-26.875,36.453-50.375c0.016-9.594-2.688-18.547-7.141-26.25 c6.422-5.25,10.781-12.156,13.266-19.375c2.719-7.75,3.656-15.906,3.656-24.203c0-5.141-1.094-10.141-2.969-15.016 c-1.375-3.469-3.172-6.891-5.375-10.125C501.125,253.938,511.984,236.703,512,216.906z M458.938,243.797h-8.844 c-3.469,0-6.813,1.391-9.25,3.828s-3.844,5.813-3.844,9.25s1.406,6.813,3.844,9.25s5.781,3.844,9.25,3.844 c2.516,0,4.578,0.563,6.594,1.609c2.969,1.516,5.797,4.375,7.75,7.719c1.969,3.281,2.875,7.047,2.813,8.906 c0.031,8.297-1.438,15.078-3.719,19.078c-1.156,2.031-2.391,3.453-3.906,4.594c-1.531,1.125-3.438,2.063-6.344,2.688 c-4.938,1-8.813,4.734-10.031,9.625c-1.234,4.906,0.438,10.031,4.344,13.25c6.094,5.094,9.875,12.313,9.875,20.594 c-0.031,14.844-12.047,26.875-26.922,26.906h-6.234c-5.438,0-10.313,3.344-12.219,8.438c-1.938,5.094-0.531,10.813,3.563,14.438 c5.688,5.078,9.172,12.063,9.172,20.047c-0.016,14.844-12.047,26.859-26.922,26.891h-191.25 c-20.063,0.016-36.031-2.063-48.313-5.969c-9.25-2.938-16.391-6.828-22.172-11.688c-1.938-1.656-3.703-3.469-5.375-5.359V245.5 c2.109-0.531,4.547-0.875,7.625-0.875c11.328,0,21.156-2.047,29.453-6.25c6.188-3.109,11.375-7.406,15.5-12.172 c6.188-7.203,10.219-15.297,13.719-23.484c3.5-8.219,6.5-16.625,10.031-24.906l0.156-0.313l51.328-129.281 c5.109-12.625,17.281-20.266,30.125-20.281c4.047,0,8.172,0.766,12.172,2.391c12.656,5.094,20.297,17.266,20.313,30.141 c0,4.047-0.75,8.156-2.375,12.172l-31,76.672c-0.422,1.016-0.688,2.047-0.844,3.125c-0.391,2.906-0.594,5.656-0.594,8.313 c0,4.875,0.688,9.484,2.484,13.781c1.313,3.219,3.297,6.203,5.734,8.563c3.656,3.594,8.078,5.594,12.031,6.625 c4,1.063,7.719,1.281,11.172,1.297c7.422-0.047,14.109-1.094,17.969-1.031c3.641,0,43.688,0,47.219,0h75.891 c14.844-0.016,26.938,12.047,26.938,26.922C485.813,231.75,473.781,243.781,458.938,243.797z"></path> </g> </g></svg>
                        </div>
                        `

                        const closeFormBtn = document.querySelector('.closeModalBtnContainer')
                        closeFormBtn.addEventListener('click', closeReviewForm)
                    } else {
                        document.querySelector('.askQuestionFormError').textContent = 'There was an error submitting this question'
                    }
                }
            }

            const submitQuestion = async () => {
                const res = await fetch(`https://${window.Shopify.shop}/apps/api/customerQuestion/create`, {method: 'POST', body: JSON.stringify(askQuestionFormData)})
                if (res.status === 200) {
                    return true
                } else {
                    return false
                }
            }

            const renderQuestion = (step) => {
                const reviewFormOverlay = document.querySelector('.reviewFormOverlay')
                reviewFormOverlay.innerHTML = `
                <div class="askQuestionForm">
                    <div class="closeModalBtnContainer" style="top: 5px; right: 10px">
                        <svg class="closeModalBtn" style="height: 12px; width: 12px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="white"></path> </g></svg>
                    </div>
                    <svg class="askQuestionForwardBtn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    <svg class="askQuestionBackBtn ${currentStep === 1 ? "hidden" : ""}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M6 12L11 7M6 12L11 17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    <h1>${step.title}</h1>
                    <div class="inputContainer">
                        ${step.input}
                        <p class="askQuestionFormError"></p>
                    </div>
                    <div class="stepsContainer">
                        ${renderSteps(numSteps)}
                    </div>
                </div>
                `

                const inputEl = document.querySelector('.askQuestionInput')
                inputEl.value = askQuestionFormData[inputEl.dataset.questionkey]

                document.querySelector('.askQuestionBackBtn').addEventListener('click', lastQuestion)
                document.querySelector('.askQuestionForwardBtn').addEventListener('click', nextQuestion)
                
                const closeFormBtn = document.querySelector('.closeModalBtnContainer')
                closeFormBtn.addEventListener('click', closeReviewForm)
            }

            reviewFormOverlay.classList.remove('hidden')
            renderQuestion(steps[currentStep-1])
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
            const closeFormBtn = document.querySelector('.closeFormBtn')
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

        // toggling between reviews and questions functionality
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

