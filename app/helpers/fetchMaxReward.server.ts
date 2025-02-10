import { Session } from '@shopify/shopify-app-remix/server'
import db from '../db.server'

export default async function fetchMaxReward(session: Session) {
    // determine max reward configured
    const rewards = await db.reward.findFirst({where: {store: {equals: session.shop}}})
    
    const maxReward = !rewards ? undefined : 
        
        await Promise.all([rewards.goodId, rewards.subparId, rewards.perfectId].map(async (rewardSettingId) => {
            const rewardSetting = await db.rewardSetting.findFirst({where: {id: rewardSettingId}})
            if (!rewardSetting || rewardSetting && rewardSetting.selectedRewardType === "none") {
                return null
            } else {

                switch (rewardSetting.selectedRewardType) {
                    case "free-shipping":
                        if (rewardSetting.minPurchaseType === "none") {
                            return rewardSetting.selectedRewardType
                        } else {
                            if (rewardSetting.minPurchaseType === "")
                            return `${rewardSetting.selectedRewardType} when you purchase at `
                        }
                }

                return rewardSetting.selectedRewardType
            }
        }))
        .then(res => res.filter(rewardType => rewardType !== null))
        .then(res => res[res.length - 1])

    return maxReward
}