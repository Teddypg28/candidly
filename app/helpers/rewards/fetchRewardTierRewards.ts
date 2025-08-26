import { RewardSetting } from '@prisma/client'
import db from '../../db.server'

export default async function fetchRewardTierRewards(rewardSettingsId: string | undefined) {
    const rewardSettings = await db.reward.findFirst({where: {id: {equals: rewardSettingsId}}})
    if (!rewardSettings) return []

    const settingsIds = [rewardSettings.subparId, rewardSettings.goodId, rewardSettings.perfectId]
    const rewardNames = await Promise.all(settingsIds.map(async (id) => {
        const settings = await db.rewardSetting.findFirst({where: {id: {equals: id}}}) as RewardSetting
        if (settings.selectedRewardType === "bxgy") {
            const rewardValue = settings.bxgyRewardType === "dollar" ? `$${settings.bxgyDollarAmount} Off` : settings.bxgyRewardType === "percent" ? `${settings.bxgyPercentageAmount*100}% Off` : "Free"
            return `Buy ${settings.bxgyPurchaseAmount} Get ${settings.bxgyReceiveAmount} ${rewardValue}`
        } else if (settings.selectedRewardType === "dollar") {
            return `$${settings.dollarAmount} Off`
        } else if (settings.selectedRewardType === "percent") {
            return `${settings.percentageAmount*100}% Off`
        } else {
            return "Free Shipping"
        }
    }))
    return rewardNames
}