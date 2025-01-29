const generateReviewStatsMarkup = () => {
    const reviewStatsMarkup = []
    for (let i = 5; i>0; i--) {
        const numMatchingStarReviews = reviewData.starDistribution[i]
        const fillWidth = numMatchingStarReviews / reviewData.totalReviews * 100
        reviewStatsMarkup.push(
            `<div class='reviewBarContainer'>
                <p>${i}</p>
                <div>★</div>
                <div class='outerFillContainer'>
                    <div class='innerFillContainer' style="width: ${fillWidth}%; background-color: ${reviewSettings.primaryColor}"> </div>
                </div>
                <p>${numMatchingStarReviews}</p>
            </div>`
        )
    }
    return reviewStatsMarkup.join('')
}