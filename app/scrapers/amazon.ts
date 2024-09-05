import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

export default async function amazonScraper(userInput: any) {

    const { productLink, selectedImportRatings, numberOfReviews } = userInput

    const productId = productLink.split('/dp/')[1].split('/ref')[0]
    const productName = productLink.split('.com/')[1].split('/dp')[0]

    const reviews: any = []

    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()

    const scrape = async (currentPage: number) => {

        const reviewsLink = `https://www.amazon.com/${productName}/product-reviews/${productId}/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=${currentPage}`

        await page.goto(reviewsLink)
        const data = await page.content()
    
        const $ = cheerio.load(data)
        
        $('div').find('[id^="customer_review-"]').each(function(i, el) {
    
            const reviewDetails: any = {}
    
            reviewDetails.rating = parseInt($(el).find('[class*="review-rating"]').children('.a-icon-alt').text().split('.0')[0])
    
            if (selectedImportRatings.includes(reviewDetails.rating.toString()) && reviews.length < numberOfReviews) {
    
                reviewDetails.name = $(el).find('[class="a-profile-name"]').text()
                reviewDetails.title = $(el).find('[class*="review-title"]').children('span').text()
                reviewDetails.body = $(el).find('[class*="review-text"]').children('span').text()
        
                reviews.push(reviewDetails)
    
            }
    
        })

        if (reviews.length === numberOfReviews) {

            await browser.close()
            return reviews

        }

        return scrape(currentPage+1)
        
    }

    return await scrape(1)

}