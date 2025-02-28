
export default function calculateCurrentRewardTier(headline: string, body: string, uploadedMediaRef: React.MutableRefObject<any>, primaryFormColor: string) {
    const reviewHeadlineWordList = headline.trim().split(/\s+/).filter(word => word !== "")
    let reviewHeadlineTier
    let reviewHeadlineStatusColor

    if (reviewHeadlineWordList.length <= 3) {
        reviewHeadlineTier = 1
    } else if (reviewHeadlineWordList.length > 3 && reviewHeadlineWordList.length <= 9) {
        reviewHeadlineTier = 2
    } else {
        reviewHeadlineTier = 3
        reviewHeadlineStatusColor = "#67af98"
    }

    const reviewBodyWordList = body.trim().split(/\s+/).filter(word => word !== "")

    let reviewBodyTier
    let reviewBodyStatusColor = primaryFormColor

    if (reviewBodyWordList.length <= 14) {
        reviewBodyTier = 1
    } else if (reviewBodyWordList.length > 14 && reviewBodyWordList.length <= 39) {
        reviewBodyTier = 2
    } else {
        reviewBodyTier = 3
        reviewBodyStatusColor = '#67af98'
    }

    let uploadedMediaTier
    let uploadedMediaStatusColor = primaryFormColor

    if (uploadedMediaRef.current.length === 0) {
        uploadedMediaTier = 1
    } else if (uploadedMediaRef.current.length > 0 && uploadedMediaRef.current.length <= 1) {
        uploadedMediaTier = 2
    } else {
        uploadedMediaTier = 3
        uploadedMediaStatusColor = "#67af98"
    }

    const reviewScoreTier = Math.floor((reviewHeadlineTier + reviewBodyTier + uploadedMediaTier) / 3)

    return {
        score: reviewScoreTier,
        media: {
            tier: uploadedMediaTier, 
            color: uploadedMediaStatusColor
        }, 
        headline: {
            tier: reviewHeadlineTier, 
            color: reviewHeadlineStatusColor,
            wordlist: reviewHeadlineWordList
        },
        body: {
            tier: reviewBodyTier,
            color: reviewBodyStatusColor,
            wordList: reviewBodyWordList
        } 
    }
}