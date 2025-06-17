const createReviewStars = () => {
     // links the stars to the reviews section
     const navigationTag = document.createElement('a')
     navigationTag.style.textDecoration = 'none'
     navigationTag.style.color = 'black'
     navigationTag.style.display = 'flex'
     navigationTag.style.alignItems = 'center'
     navigationTag.style.fontSize = '16px'
    
     let navigationTagHref
     const divs = document.querySelectorAll('div')
     for (let i = 0; i<divs.length; i++) {
         if (divs[i].id.includes('candidly')) {
             navigationTagHref = divs[i].id
             break
         }
     }
     navigationTag.href = `#${navigationTagHref}`
     navigationTag.style.marginTop = '15px'
    
     let starsLeft
     for (let i = 1; i<=5; i++) {
         starsLeft = (avgRating + 1) - i
         if (starsLeft >= 1) {
             // add a full star
             navigationTag.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32">
                                     <defs>
                                     <linearGradient id="grad-${i}">
                                         <stop offset="50%" stop-color="${reviewSettings.primaryColor}"/>
                                         <stop offset="50%" stop-color="${reviewSettings.primaryColor}"/>
                                     </linearGradient>
                                     </defs>
                                     <path fill="url(#grad-${i})" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                                 l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                 </svg>`
    
         } else if (starsLeft > 0) {
             // add a half star
             navigationTag.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32">
                                         <defs>
                                         <linearGradient id="grad-${i}">
                                             <stop offset="50%" stop-color="${reviewSettings.primaryColor}"/>
                                             <stop offset="50%" stop-color="#e8e8e8"/>
                                         </linearGradient>
                                         </defs>
                                         <path fill="url(#grad-${i})" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                                     l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                     </svg>`                                
         } else {
             // add an empty star
             navigationTag.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32">
                                         <defs>
                                         <linearGradient id="grad-${i}">
                                             <stop offset="50%" stop-color="#e8e8e8"/>
                                             <stop offset="50%" stop-color="#e8e8e8"/>
                                         </linearGradient>
                                         </defs>
                                         <path fill="url(#grad-${i})" d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
                                     l11.547-1.2L16.026,0.6L20.388,10.918z"/>
                                     </svg>`
         }}
    
    // displays the total number of reviews next to the stars
    const totalNumReviewsContainer = document.createElement('div')
    totalNumReviewsContainer.textContent = `${reviewData.totalReviews} ${reviewData.totalReviews === 1 ? 'Review' : 'Reviews'}`
    totalNumReviewsContainer.style.marginLeft = '10px'
    totalNumReviewsContainer.style.padding = '0px'
    navigationTag.appendChild(totalNumReviewsContainer)
    
    const priceContainer = document.querySelector('.price__container') || document.querySelector('product-price')
    priceContainer.appendChild(navigationTag)

    const defaultRatingWrapperElement = document.querySelector('.rating-wrapper')
    if (defaultRatingWrapperElement) defaultRatingWrapperElement.remove()

 }
 
