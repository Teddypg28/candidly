export default function fetchRewardTiersScore(title: string, body: string, uploadedMedia: React.MutableRefObject<any>) {

    const tiers = {
        title: {
            score: 0,
            length: 0,
            perfectLength: 10
        },
        body: {
            score: 0,
            length: 0,
            perfectLength: 40
        },
        uploadedMedia: {
            score: 0,
            length: 0,
            perfectLength: 2
        }
    }

    // calculate title tier
    const reviewTitleWordList = title.trim().split(/\s+/).filter(word => word !== "")
    tiers.title.length = reviewTitleWordList.length
    if (reviewTitleWordList.length <= 3) {
        tiers["title"].score = 1
    } else if (reviewTitleWordList.length > 3 && reviewTitleWordList.length <= 9) {
        tiers["title"].score = 2
    } else {
        tiers["title"].score = 3
    }

    // calculate body tier
    const reviewBodyWordList = body.trim().split(/\s+/).filter(word => word !== "")
    tiers.body.length = reviewBodyWordList.length
    if (reviewBodyWordList.length <= 14) {
        tiers["body"].score = 1
    } else if (reviewBodyWordList.length > 14 && reviewBodyWordList.length <= 39) {
        tiers["body"].score = 2
    } else {
        tiers["body"].score = 3
    }

    // calculate uploaded media tier
    if (uploadedMedia.current.length === 0) {
        tiers["uploadedMedia"].score = 1
    } else if (uploadedMedia.current.length > 0 && uploadedMedia.current.length <= 1) {
        tiers["uploadedMedia"].score = 2
    } else {
        tiers["uploadedMedia"].score = 3
    }
    
    return {tiers: {...tiers}, totalScore: Math.floor((tiers["title"].score + tiers["body"].score + tiers["uploadedMedia"].score) / 3)}
}