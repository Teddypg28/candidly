import { RewardSetting } from '@prisma/client';

export default function fetchMinPurchaseRequirementStatement(rewardSetting: RewardSetting) {
    if(rewardSetting.minPurchaseType === "quantity") {
        return ` when you purchase at least ${rewardSetting.minPurchaseQuantityValue} total`
    }

    if (rewardSetting.minPurchaseType === "dollars") {
        return ` when you spend at least $${rewardSetting.minPurchaseDollarValue}`
    }

    return ""
}