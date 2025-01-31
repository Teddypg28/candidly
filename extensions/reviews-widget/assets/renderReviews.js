// renders review metadata and calls function to render the corresponding reviews - or displays "no reviews" message
const renderReviews = () => {
    document.querySelector('.mainReviewContainer').innerHTML = `
            <div class='headingBtnContainer'>
                <h1 class='heading'>Customer Reviews</h1>
                <h3 class='noReviewsMobile'>Be the first to write a review!</h3>
            </div>
            <div class='noReviews'>
                <h3>This product currently has no reviews</h3>
            </div>
            <div class='hasReviewsWrapper'>
                <div class='reviewStatsWrapper'>
                    <div class='reviewStatsContainer'>
                        <p>Average Customer Rating</p>
                        <h1 id='averageCustomerReview'></h1>
                        <p id='totalCustomerReviews'></h1>
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
        `

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
                    fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=1&limit=5&sort=lowest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                } 
                if (currentSortBy === 'Highest') {
                    fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=1&limit=5&sort=highest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                }
                if (currentSortBy === 'Oldest') {
                    fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=1&limit=5&sort=oldest`)
                        .then(res => res.json())
                        .then(data => reviewData = data)
                        .then(() => setCurrentPage(1, currentSortBy))
                }
                if (currentSortBy === 'Newest') {
                    fetch(`https://blizzardbites.myshopify.com/apps/reviews/reviews/${reviewProductId}?page=1&limit=5&sort=newest`)
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
        document.querySelector('.hasReviewsWrapper').classList.remove('hidden')
        document.querySelector('.noReviews').classList.add('hidden')
        document.querySelector('.noReviewsMobile').classList.add('hidden')

        document.getElementById('reviewBarWrapper').innerHTML = generateReviewStatsMarkup()
        document.getElementById('averageCustomerReview').textContent = `${avgRating.toFixed(1)} out of 5`
        document.getElementById('totalCustomerReviews').textContent = `${reviewData.totalReviews} customer ${reviewData.totalReviews > 1 ? 'reviews' : 'review'}`

        // this function will then render the actual reviews, starting at page 1
        setCurrentPage(1, 'Newest')
}