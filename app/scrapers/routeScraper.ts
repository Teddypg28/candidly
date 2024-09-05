import amazonScraper from "./amazon";

export default async function routeScraper(data: any) {

    if (data.productLink.includes('amazon.com')) {
        return await amazonScraper(data)
    }

}