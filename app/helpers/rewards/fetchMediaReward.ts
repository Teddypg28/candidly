import { Reward } from '@prisma/client'
import db from '../../db.server'
import fetchProductTitle from './fetchProductTitle'

export async function fetchMediaReward(reward: Reward) {

    let rewardTitle = ''

    const mediaReward = await db.rewardSetting.findFirst({where: {id: {equals: reward.mediaId}}, include: {eligibleCollections: true, eligibleProducts: true}})

    if (!mediaReward) return ''

    if (mediaReward.selectedRewardType === "free-shipping") {
        rewardTitle = "Free Shipping"
    } else if (mediaReward.selectedRewardType === "bxgy") {
        const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, mediaReward.bxgyPurchaseProductId)
        const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, mediaReward.bxgyReceiveProductId)

        rewardTitle = `"Buy ${mediaReward.bxgyPurchaseAmount} ${bxgyPurchaseProductTitle}, Get ${mediaReward.bxgyReceiveAmount} ${bxgyReceiveProductTitle} - ${mediaReward.bxgyRewardType === "free" ? "Free" :
        mediaReward.bxgyRewardType === "dollar" ? `$${mediaReward.bxgyDollarAmount} Off` : `${mediaReward.bxgyPercentageAmount * 100}% Off`}"`
    } else {
        if (mediaReward.selectedRewardType === "dollar") {
            rewardTitle = `$${mediaReward.dollarAmount} off`

        } else if (mediaReward.selectedRewardType === "percent") {
            rewardTitle = `${mediaReward.percentageAmount * 100}% off`
        } 
    } 

    return rewardTitle
}