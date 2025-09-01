import { Reward } from '@prisma/client'
import db from '../../db.server'
import fetchProductTitle from './fetchProductTitle'
import fetchMinPurchaseRequirementStatement from './fetchMinPurchaseRequirementStatement'

export async function fetchMediaReward(reward: Reward) {

    let rewardTitle = ''

    const mediaReward = await db.rewardSetting.findFirst({where: {id: {equals: reward.mediaId}}, include: {eligibleCollections: true, eligibleProducts: true}})
    
    if (!mediaReward) return ''
    
    const minPurchaseStatement = fetchMinPurchaseRequirementStatement(mediaReward)

    if (mediaReward.selectedRewardType === "free-shipping") {
        rewardTitle = "free shipping"
    } else if (mediaReward.selectedRewardType === "bxgy") {
        const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, mediaReward.bxgyPurchaseProductId)
        const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, mediaReward.bxgyReceiveProductId)

        rewardTitle = `"buy ${mediaReward.bxgyPurchaseAmount} ${bxgyPurchaseProductTitle}, get ${mediaReward.bxgyReceiveAmount} ${bxgyReceiveProductTitle} - ${mediaReward.bxgyRewardType === "free" ? "free" :
        mediaReward.bxgyRewardType === "dollar" ? `$${mediaReward.bxgyDollarAmount} off` : `${mediaReward.bxgyPercentageAmount * 100}% off`}"`
    } else {
        if (mediaReward.selectedRewardType === "dollar") {
            rewardTitle = `$${mediaReward.dollarAmount} off`

        } else if (mediaReward.selectedRewardType === "percent") {
            rewardTitle = `${mediaReward.percentageAmount * 100}% off`
        } 
    } 

    return rewardTitle += minPurchaseStatement
}