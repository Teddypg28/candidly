import { RewardSetting } from '@prisma/client'
import db from '../../db.server'
import { FetchedReward } from '~/types/types'

export default async function fetchRewardTiers(store: string) {

    const configuredRewards = await db.reward.findFirst({where: {store: {equals: store}}})
    if (!configuredRewards) {
        return [{name: null}, {name: null}, {name: null}]
    }

    const subparReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.subparId}}) as RewardSetting
    const goodReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.goodId}}) as RewardSetting
    const perfectReward = await db.rewardSetting.findFirst({where: {id: configuredRewards.perfectId}}) as RewardSetting;

    const rewards: FetchedReward[] = [];
    [subparReward, goodReward, perfectReward].map((reward) => {
        switch (reward.selectedRewardType) {
            case 'free-shipping':
                rewards.push({name: 'Free Shipping'})
                break
            case 'dollar':
                rewards.push({name: `$${reward.fixedAmount} Discount`})
                break
            case 'percent':
                rewards.push({name: `${reward.percentageAmount}% Discount`})
                break
            case 'bogo':
                const discountAmount = reward.bogoRewardType === "free" ? "Free" : reward.bogoRewardType == "percent" ?
                `${reward.bogoDiscountAmount}% Off` : `$${reward.bogoDiscountAmount} Off`
                rewards.push(
                    {
                        name: `Buy ${reward.bogoPurchaseAmount}, Get ${reward.bogoReceiveAmount} - ${discountAmount}`
                    })
                break
            default:
                rewards.push({name: null})
        }
    })

    return rewards
}