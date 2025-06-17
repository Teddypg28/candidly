import fetchRewardTiers from './fetchRewardTiers'

export default async function fetchMaxReward(shop: string) {
    const rewardTiers = await fetchRewardTiers(shop)
    if (rewardTiers.every(tier => tier === rewardTiers[0])) {
        return undefined
    }
    let maxReward: string = ''
    rewardTiers.forEach(tier => {
        if (tier !== "No Reward") {
            maxReward = tier
        }
    })
    return maxReward
}