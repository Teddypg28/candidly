import { RewardSetting } from '@prisma/client'
import db from '../db.server'

export default async function fetchRewardTiers(store: string) {

    const configuredRewards = await db.reward.findFirst({where: {store: {equals: store}}})
    if (!configuredRewards) {
        return ['No Reward', 'No Reward', 'No Reward']
    }

    const subparReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.subparId}}) as RewardSetting
    const goodReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.goodId}}) as RewardSetting
    const perfectReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.perfectId}}) as RewardSetting;

    const rewards: string[] = [];
    [subparReward, goodReward, perfectReward].map((reward) => {
        switch (reward.selectedRewardType) {
            case 'free-shipping':
                rewards.push('Free Shipping')
                break
            case 'dollar':
                rewards.push(`$${reward.fixedAmount} Discount`)
                break
            case 'percent':
                rewards.push(`${reward.percentageAmount}% Discount`)
                break
            case 'bogo':
                const discountAmount = reward.bogoRewardType === "free" ? "Free" : reward.bogoRewardType == "percent" ?
                `${reward.bogoDiscountAmount}% Off` : `$${reward.bogoDiscountAmount} Off`
                rewards.push(`Buy ${reward.bogoPurchaseAmount}, Get ${reward.bogoReceiveAmount} - ${discountAmount}`)
                break
            default:
                rewards.push('No Reward')
        }
    })

    return rewards
}