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
    const closeMediaCarouselBtn = document.querySelector('.closeModalBtnContainer')
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
const renderCurrentPageReviews = (currentPage, currentSortBy) => {

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
                .then(() => renderCurrentPageReviews(currentPage + 1, currentSortBy))
        }
    })

    prevPageBtn.addEventListener('click', () => {
        if (currentPage - 1 !== 0) {
            fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=${currentPage-1}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => renderCurrentPageReviews(currentPage - 1, currentSortBy))
        }
    })

    const paginatorNumbers = document.querySelectorAll('.paginatorNumber')
    paginatorNumbers.forEach(el => {
        el.addEventListener('click', () => {
            fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=${parseInt(el.dataset.page)}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => renderCurrentPageReviews(parseInt(el.dataset.page), currentSortBy))
        })
        if (el.dataset.page === currentPage.toString()) {
            return el.classList.add('selected')
        }
    })
}

// renders review metadata and calls function to render the corresponding reviews - or displays "no reviews" message
const renderWidgetSkeleton = () => {
    document.querySelector('.mainReviewContainer').innerHTML = `
            <div class='reviewsQuestionsWidgetHeader'>
                <div class='headingBtnContainer'>
                    <h1 class='heading'>Customer <span class='reviewsOrQuestions'>Reviews</span></h1>
                    <div class='btnContainer'>
                        <div class='writeReviewBtn hoverEffect'>Write Review</div>
                        <div class='askQuestionBtn hoverEffect'>Ask Question</div>
                    </div>
                </div>
                <div class='reviewsQuestionsContainer'>
                    <div class='showReviewsBtn'>Reviews (${reviewData.totalReviews})</div>
                    <div class='showQuestionsBtn'>Questions (${questionsWithAnswers.length})</div>
                </div>
                <div class='reviewsQuestionsContainerSeparator'> </div>
            </div>
            <div class="noReviewsBlock ${reviewData.totalReviews > 0 ? "hidden" : ""}">Be the first to write a review!</div>
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
            </div>
            <div>
                <div id='questions' class='hidden'></div>
            </div>
        `

        if (isReviewFormDisabled === "true") document.querySelector('.writeReviewBtn').classList.add('hidden')

        const reviewFormOverlay = document.createElement('div')
        reviewFormOverlay.className = 'hidden reviewFormOverlay'
        document.body.appendChild(reviewFormOverlay)

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
                        .then(() => renderCurrentPageReviews(1, currentSortBy))
                } 
                if (currentSortBy === 'Highest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=highest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => renderCurrentPageReviews(1, currentSortBy))
                }
                if (currentSortBy === 'Oldest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=oldest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => renderCurrentPageReviews(1, currentSortBy))
                }
                if (currentSortBy === 'Newest') {
                    fetch(`https://${window.Shopify.shop}/apps/api/reviews/${reviewProductId}?page=1&limit=5&sort=newest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => renderCurrentPageReviews(1, currentSortBy))
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

        renderQuestions()

        // this function will then render the actual reviews, starting at page 1
        if (reviewData.totalReviews > 0) {
            renderCurrentPageReviews(1, 'Newest')
        }

        // toggling between reviews and questions functionality
        document.querySelector('.showReviewsBtn').style.fontWeight = 'bold'
        document.querySelector('.showReviewsBtn').style.borderBottom = '2px solid black'

        document.querySelector('.showQuestionsBtn').addEventListener('click', () => {
            document.querySelector('#reviews').classList.add('hidden')
            document.querySelector('#questions').classList.remove('hidden')
            document.querySelector('.flexContainer').classList.add('hidden')
            document.querySelector('.hasReviewsWrapper').classList.add('hidden')
            document.querySelector('.noReviewsBlock').classList.add('hidden')
            document.querySelector('.showQuestionsBtn').style.fontWeight = 'bold'
            document.querySelector('.showQuestionsBtn').style.borderBottom = '2px solid black'
            document.querySelector('.showReviewsBtn').style.fontWeight = 'normal'
            document.querySelector('.showReviewsBtn').style.borderBottom = 'none'
            document.querySelector('.reviewsOrQuestions').textContent = 'Questions'
        })

        document.querySelector('.showReviewsBtn').addEventListener('click', () => {
            document.querySelector('#reviews').classList.remove('hidden')
            document.querySelector('#questions').classList.add('hidden')
            document.querySelector('.flexContainer').classList.remove('hidden')
            if (reviewData.totalReviews > 0) {
                document.querySelector('.hasReviewsWrapper').classList.remove('hidden')
            } else {
                document.querySelector('.noReviewsBlock').classList.remove('hidden')
            }
            document.querySelector('.showQuestionsBtn').style.fontWeight = 'normal'
            document.querySelector('.showQuestionsBtn').style.borderBottom = 'none'
            document.querySelector('.showReviewsBtn').style.fontWeight = 'bold'
            document.querySelector('.showReviewsBtn').style.borderBottom = '2px solid black'
            document.querySelector('.reviewsOrQuestions').textContent = 'Reviews'
        })

        // question form logic
        const askQuestionBtn = document.querySelector('.askQuestionBtn')
        askQuestionBtn.addEventListener("click", renderCustomerQuestionForm)

        // review form logic
        const writeReviewBtn = document.querySelector('.writeReviewBtn')
        writeReviewBtn.addEventListener('click', renderReviewForm)
}

