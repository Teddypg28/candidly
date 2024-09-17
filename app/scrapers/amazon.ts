import * as cheerio from 'cheerio'
import axios from 'axios'

export default async function amazonScraper(userInput: any) {

    // const { productLink, selectedImportRatings, numberOfReviews } = userInput

    // const productId = productLink.split('/dp/')[1].split('/ref')[0]
    // const productName = productLink.split('.com/')[1].split('/dp')[0]

    const reviews: any = []

    const scrape = async (currentPage: number) => {

        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,*/*");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
        myHeaders.append("cookie", "session-id=147-6157787-9576244; session-id-time=2082787201l; i18n-prefs=USD; ubid-main=133-7369544-1942213; lc-main=en_US; session-token=mEl0ByXZ/KxK1h0qvZSXfyPkMBy14uaNdbo11F1UvmEIxBBwm7Wz/wX01vdCBJeAcgT+A1pw6Va3n1WW6vfJ7PWbcbtqZ7FuAn5R4ggLIPKDdsc43yOBKmrqyfcTMTQiIt00nw5HEIQsY29W0GHDAOEMU9d/BWY+Mx1bueqFer5jaoPMOSElpJCl3zBhrDKqohz5uW0OllIeZdKmAXd4AwPlNggZZPtvBvJ72VE/QsLXOsgXL5QVqaiRcSve50EdI7QFkvL5XkjlTzf+aYwIXAuARiXXyczppssNLJgsfjZxTeAMCON1AS8cIL7cd0yTcvYy+TrYnI8KgBYb/GMscBwlZ3Y+czVi; csm-hit=s-JD7MYVCQ3CTKPXRFDANZ|1726464368646; session-referrer=https%3A%2F%2Fwww.amazon.com%2Froller-back-foam-wheel-pain%2Fdp%2FB07TLP8DKC%2Fref%3Dsr_1_13_sspa%3Fcrid%3D3CBML4YPYGH0P%26dib%3DeyJ2IjoiMSJ9.ciaaomD2wA2BOR51rxdOasBsDQ2RR5FkV0NQBsY3NuG1ocReQxR5RLFaiX8OrP5A9axdjke-fveDyb4hwk4SIH10-_NIpdHszrKXZnL6-cJwb0HDS06g09As6NID02jJiTUfybH5jLE4Fm_n0BEVFIf4YhObRTJrTYxabwJ1Vng1fTy1W9XQQRFV3Yk4xkoBp0Wgg7OvVdZKoY7uIx36OhFGt-9snU6JfS3dATXxtvTgeUOdu-85VYmsCAFCTaQ1DVWbCnUuzttjqCE2erRf64XVkxLjZUQkR7xVayD9sZw.QTcf_YUpPim6Q1LRxL7OqSQ1K9aYjfh8UfBUQTAbtsQ%26dib_tag%3Dse%26keywords%3Dback%252Bstretcher%26qid%3D1717594271%26sprefix%3Dback%252Bstretche%252Caps%252C116%26sr%3D8-13-spons%26sp_csd%3Dd2lkZ2V0TmFtZT1zcF9tdGY%26th%3D1; session-id=147-6157787-9576244; session-id-time=2082787201l; session-token=mEl0ByXZ/KxK1h0qvZSXfyPkMBy14uaNdbo11F1UvmEIxBBwm7Wz/wX01vdCBJeAcgT+A1pw6Va3n1WW6vfJ7PWbcbtqZ7FuAn5R4ggLIPKDdsc43yOBKmrqyfcTMTQiIt00nw5HEIQsY29W0GHDAOEMU9d/BWY+Mx1bueqFer5jaoPMOSElpJCl3zBhrDKqohz5uW0OllIeZdKmAXd4AwPlNggZZPtvBvJ72VE/QsLXOsgXL5QVqaiRcSve50EdI7QFkvL5XkjlTzf+aYwIXAuARiXXyczppssNLJgsfjZxTeAMCON1AS8cIL7cd0yTcvYy+TrYnI8KgBYb/GMscBwlZ3Y+czVi");
        myHeaders.append("device-memory", "8");
        myHeaders.append("downlink", "10");
        myHeaders.append("dpr", "2");
        myHeaders.append("ect", "4g");
        myHeaders.append("origin", "https://www.amazon.com");
        myHeaders.append("priority", "u=1, i");
        myHeaders.append("referer", "https://www.amazon.com/roller-back-foam-wheel-pain/product-reviews/B07TLP8DKC/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews");
        myHeaders.append("rtt", "100");
        myHeaders.append("sec-ch-device-memory", "8");
        myHeaders.append("sec-ch-dpr", "2");
        myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"");
        myHeaders.append("sec-ch-ua-mobile", "?1");
        myHeaders.append("sec-ch-ua-platform", "\"Android\"");
        myHeaders.append("sec-fetch-dest", "empty");
        myHeaders.append("sec-fetch-mode", "cors");
        myHeaders.append("sec-fetch-site", "same-origin");
        myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36");
        myHeaders.append("x-requested-with", "XMLHttpRequest");

        const raw = "sortBy=&reviewerType=all_reviews&formatType=&mediaType=&filterByStar=&filterByAge=&pageNumber=2&filterByLanguage=&filterByKeyword=&shouldAppend=true&deviceType=mobile&canShowIntHeader=true&reftag=cm_cr_arp_mb_paging_btm_2&pageSize=10&asin=B07TLP8DKC&scope=reviewsAjax0";

        const response = await fetch("https://www.amazon.com/hz/reviews-render/ajax/reviews/get/ref=cm_cr_arp_mb_paging_btm_2", {method: 'POST', headers: myHeaders, body: raw, redirect: 'follow'})
        
        const text = await response.text()

        console.log(text)

        return true

    }

    return await scrape(1)

}