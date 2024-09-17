import amazonScraper from "./amazon";
import aliexpressScraper from "./aliexpress";
import walmartScraper from "./walmart";

export default async function scraperRouter(data: any) {

    if (data.productLink.includes('amazon.com')) {

        return await amazonScraper(data)
        
    }

    if (data.productLink.includes('aliexpress.us')) {
        
        return await aliexpressScraper(data)

    }

    if (data.productLink.includes('walmart.com')) {
        
        return await walmartScraper(data)

    }

}