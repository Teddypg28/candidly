// returns the date of the review in a string format
const getDate = (reviewDate) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const date = new Date(reviewDate)
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

const generatePaginatorButtonMarkup = (start, end) => {
    const buttonMarkup = []
    for (let i = start; i<=end; i++) {
        buttonMarkup.push(`<div data-page=${i} class="paginatorNumber">${i}</div>`)
    }
    return buttonMarkup.join('')
}

const generatePaginationButtons = (currentPage, numOfPages) => {
    const numOfTabsToShow = Math.min(numOfPages, 5)
    const middleIndex = Math.floor(5 / 2)
    // if currentPage is near the beginning, no need to shift the middle tab
    if (currentPage <= middleIndex + 1) {
        return generatePaginatorButtonMarkup(1, numOfTabsToShow)
    } else {
        // if there are not enough pages to center the current page
        if (currentPage + middleIndex > numOfPages) {
            return generatePaginatorButtonMarkup(numOfPages - numOfTabsToShow + 1, numOfPages)
        } else {
            // normal case: currentPage is somewhere in the middle
            return generatePaginatorButtonMarkup(currentPage - middleIndex, currentPage + middleIndex)
        }
    }
}

const generatePaginator = (currentPage, numOfPages) => {
    return (
    `<div class='paginator'>
        <div class='paginatorBtn paginatorPrev'> < Prev </div>
        <div class='paginatorNumbersContainer'>
            ${generatePaginationButtons(currentPage, numOfPages)}
        </div>
        <div class='paginatorBtn paginatorNext'> Next > </div>
    </div>`)
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
        return `<img data-key=${index} class="mediaItem" src="${media.url}" style="border: ${border}"  />`
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
                    <img class="currentCarouselItem" src="${src}" />
                    <div class="mediaCarouselReviewDetails"> 
                        <div class='reviewerName' style="color: ${reviewSettings.primaryColor}">${reviewData.reviews[index].name}</div>
                        <div style="display: flex; align-items: center; gap: 15px">
                            <div>${generateStars(reviewData.reviews[index].rating)}</div>
                            <p>${getDate(new Date(reviewData.reviews[index].date))}</p>
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

const setCurrentPage = (currentPage, currentSortBy) => {
    const numOfPages = reviewData.totalPages

    const reviewMarkup = reviewData.reviews.map((review, index) => {
        const reviewMediaContainer = review.media.length > 0 ?
        `<div class="reviewMediaContainer">
            ${review.media.map((mediaItem, index) => {
               return `<img key=${index} class="reviewMediaItem" src="${mediaItem.url}" />`
            }).join('')}
        </div>` : ''

        return (
            `<div class='reviewContainer' key=${index}>
                <p>${getDate(new Date(review.date))}</p>
                <div class='ratingNameContainer'>
                    <div>${generateStars(review.rating)}</div>
                    <div class='reviewerName' style="color: ${reviewSettings.primaryColor}">${review.name}</div>
                </div>
                <h2 class='reviewHeading'>${review.title}</h2>
                <div class='reviewBody'>${review.body}</div>
            </div>
            <div class='reviewAnswerDisplayContainer'>${generateCustomQuestionAnswerMarkup(review)}</div>
            ${reviewMediaContainer}
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
            fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=${currentPage+1}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)
                .then(() => setCurrentPage(currentPage + 1, currentSortBy))
        }
    })

    prevPageBtn.addEventListener('click', () => {
        if (currentPage - 1 !== 0) {
            fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=${currentPage-1}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => setCurrentPage(currentPage - 1, currentSortBy))
        }
    })

    const paginatorNumbers = document.querySelectorAll('.paginatorNumber')
    paginatorNumbers.forEach(el => {
        el.addEventListener('click', () => {
            fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=${parseInt(el.dataset.page)}&limit=5&sort=${currentSortBy.toLowerCase()}`)
                .then(res => res.json())
                .then(data => reviewData = data)               
                .then(() => setCurrentPage(parseInt(el.dataset.page), currentSortBy))
        })
        if (el.dataset.page === currentPage.toString()) {
            return el.classList.add('selected')
        }
    })
}