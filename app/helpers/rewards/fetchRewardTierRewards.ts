import { RewardSetting } from '@prisma/client'
import db from '../../db.server'
import fetchMinPurchaseRequirementStatement from './fetchMinPurchaseRequirementStatement'

export default async function fetchRewardTierRewards(rewardSettingsId: string | undefined) {
    const reward = await db.reward.findFirst({where: {id: {equals: rewardSettingsId}}})

    if (!reward || reward.type === "media") return []

    const settingsIds = [reward.subparId, reward.goodId, reward.perfectId]
    const rewardNames = await Promise.all(settingsIds.map(async (id) => {
        const settings = await db.rewardSetting.findFirst({where: {id: {equals: id}}}) as RewardSetting
        const minPurchaseStatement = fetchMinPurchaseRequirementStatement(settings)
        if (settings.selectedRewardType === "bxgy") {
            const rewardValue = settings.bxgyRewardType === "dollar" ? `$${settings.bxgyDollarAmount} Off` : settings.bxgyRewardType === "percent" ? `${settings.bxgyPercentageAmount*100}% Off` : "Free"
            return `Buy ${settings.bxgyPurchaseAmount} Get ${settings.bxgyReceiveAmount} ${rewardValue}`
        } else if (settings.selectedRewardType === "dollar") {
            return `$${settings.dollarAmount} Off`
        } else if (settings.selectedRewardType === "percent") {
            return `${settings.percentageAmount*100}% Off`
        } else {
            return `Free Shipping`
        }
    }))
    return rewardNames
}