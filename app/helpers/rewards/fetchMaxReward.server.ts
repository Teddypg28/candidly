import fetchRewardTiers from './fetchRewardTiers'

export default async function fetchMaxReward(shop: string) {
    const rewardTiers = await fetchRewardTiers(shop)
    if (rewardTiers.every(tier => tier.name === rewardTiers[0].name)) {
        return undefined
    }
    let maxReward: string = ''
    rewardTiers.forEach(tier => {
        if (tier.name !== null) {
            maxReward = tier.name
        }
    })
    return maxReward
}