export default async function walmartScraper(userInput: any) {

    try {

        const { productLink, selectedImportRatings, numberOfReviews } = userInput
        
        const productId = productLink.split('ip/')[1].split('/')[1].split('?')[0]
    
        const collectedReviews: any = []
    
        const scrapePhotos = true
    
        const scrape = async (pageNumber: number) => {
    
            const myHeaders = new Headers();
            myHeaders.append("accept", "application/json");
            myHeaders.append("accept-language", "en-US");
            myHeaders.append("content-type", "application/json");
            myHeaders.append("downlink", "8.2");
            myHeaders.append("dpr", "2");
            myHeaders.append("priority", "u=1, i");
            myHeaders.append("referer", `https://www.walmart.com/reviews/product/${productId}?page=${pageNumber}`);
            myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"");
            myHeaders.append("sec-ch-ua-mobile", "?1");
            myHeaders.append("sec-ch-ua-platform", "\"Android\"");
            myHeaders.append("sec-fetch-dest", "empty");
            myHeaders.append("sec-fetch-mode", "cors");
            myHeaders.append("sec-fetch-site", "same-origin");
            myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36");
            myHeaders.append("wm_mp", "true");
            myHeaders.append("wm_page_url", `https://www.walmart.com/reviews/product/${productId}?page=${pageNumber}`);
            myHeaders.append("x-apollo-operation-name", "ReviewsById");
            myHeaders.append("x-enable-server-timing", "1");
            myHeaders.append("x-latency-trace", "1");
            myHeaders.append("x-o-bu", "WALMART-US");
            myHeaders.append("x-o-ccm", "server");
            myHeaders.append("x-o-gql-query", "query ReviewsById");
            myHeaders.append("x-o-mart", "B2C");
            myHeaders.append("x-o-platform", "rweb");
            myHeaders.append("x-o-platform-version", "us-web-1.157.0-0a3f4a888167027b8286c7eb667794f97a73f80b-090416");
            myHeaders.append("x-o-segment", "oaoh");
            
            const encodedData = `%7B%22itemId%22%3A%22${productId}%22%2C%22page%22%3A${pageNumber}%2C%22sort%22%3A%22relevancy%22%2C%22limit%22%3A20%2C%22filters%22%3A%5B%5D%2C%22aspect%22%3Anull%2C%22filterCriteria%22%3Anull%7D`
        
            const response = await fetch(`https://www.walmart.com/orchestra/home/graphql/ReviewsById/ab0b69d77441f9b4b402a4f9f664bcd544b56732dcb0a4ad02c8ccd3dbc8d401?variables=${encodedData}`, {headers: myHeaders, redirect: 'follow'})
            
            let isReady = false
    
            const data = await response.json()
            
            const reviews = data.data.reviews.customerReviews
    
            for (let i = 0; i<reviews.length; i++) {
    
                if (selectedImportRatings.includes(reviews[i].rating.toString())) {
    
                    const fileNames: any = []
    
                    if (scrapePhotos) {
    
                        reviews[i].photos.forEach((photo: any) => {
    
                            const fileName = photo.sizes.normal.url.replace('.bin', '.png')
                            fileNames.push(fileName)
    
                        })
                    }
    
                    collectedReviews.push({
                        name: reviews[i].userNickname,
                        rating: reviews[i].rating,
                        title: reviews[i].reviewTitle,
                        body: reviews[i].reviewText,
                        photos: fileNames
    
                    })
    
                }
    
                if (collectedReviews.length === numberOfReviews) {
                    isReady = true
                    break
                }
    
            }
    
            if (isReady) return {success: true, reviews: collectedReviews}
    
            return scrape(pageNumber + 1)
        
        }
    
        return await scrape(1)
        
    } catch (error) {

        return {sucess: false, reviews: []}
        
    }

   

}