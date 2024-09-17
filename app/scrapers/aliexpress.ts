export default async function aliexpressScraper(userInput: any) {

    const { productLink, selectedImportRatings, numberOfReviews } = userInput

    const collectedReviews: any = []
    
    const productId = productLink.split('/item/')[1].split('.html')[0]

    const scrapePhotos = true

    const scrape = async (pageNumber: number) => {
        
        const reviewsLink = `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&lang=en_US&country=US&page=${pageNumber}&pageSize=10&filter=all&sort=complex_default`
        
        const res = await fetch(reviewsLink, {headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'}})
    
        const data = await res.json()

        const reviews = data.data.evaViewList

        let isReady = false

        for (let i = 0; i<reviews.length; i++) {

            const rating = (reviews[i].buyerEval / 20).toString()

            const fileNames: any = []

            if (selectedImportRatings.includes(rating)) {

                if (scrapePhotos && reviews[i].hasOwnProperty('images')) {
                    reviews[i].images.forEach((url: string) => {
                        fileNames.push(url)
                    })
                }

                collectedReviews.push({
        
                    reviewer: reviews[i].buyerName,
                    title: '',
                    body: reviews[i].buyerTranslationFeedback,
                    rating,
                    photos: fileNames
        
                })

            }

            if (collectedReviews.length === numberOfReviews) {
                isReady = true
                break
            }

        }

        if (isReady) return collectedReviews

        return scrape(pageNumber + 1)

    }

    return await scrape(1)

}