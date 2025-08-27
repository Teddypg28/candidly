import { ActionFunctionArgs } from "@remix-run/node";
import db from '../db.server'
import fetchRewardTierRewards from "~/helpers/rewards/fetchRewardTierRewards";
import createBxgyDiscount from "~/helpers/rewards/discountCodeMutations/createBxgyDiscount";
import createBasicDiscount from "~/helpers/rewards/discountCodeMutations/createBasicDiscount";
import createFreeShippingDiscount from "~/helpers/rewards/discountCodeMutations/createFreeShippingDiscount";
import fetchProductTitle from "~/helpers/rewards/fetchProductTitle";
import fetchMinPurchaseRequirementStatement from "~/helpers/rewards/fetchMinPurchaseRequirementStatement";
import fetchCollectionTitle from "~/helpers/rewards/fetchCollectionTitle";

export const action = async ({ request } : ActionFunctionArgs) => {
    try {      
        const data = await request.json()

        let rewardTitle = ""
        let discountCode = ""

        if (!data.rewardSettingsId) return new Response(JSON.stringify({error: "missing reward settings id"}), {status: 400})
        if (!data.firstName) return new Response(JSON.stringify({error: "missing required firstName"}), {status: 401})

        const reward = await db.reward.findFirst({where: {id: {equals: data.rewardSettingsId}}})
        if (!reward) return new Response(JSON.stringify({error: "no reward settings found"}), {status: 400})

        // if rewards are disabled
        if (reward.type === "none") return new Response(JSON.stringify({status: "rewards disabled"}), {status: 200})

        // if rewards are tiers
        const reviewScore = data.tierReviewScore as number
        if (reward.type === "tiers") {
            if (!reviewScore) { 
                return new Response(JSON.stringify({error: "missing review score"}), {status: 401}) 
            } else {
                const rewardTierRewardNames = await fetchRewardTierRewards(reward.id)
                rewardTitle = rewardTierRewardNames[reviewScore-1]

                const tierRewardSettingsIds = [reward.subparId, reward.goodId, reward.perfectId]
                const rewardSetting = await db.rewardSetting.findFirst({where: {id: {equals: tierRewardSettingsIds[reviewScore-1]}}, include: {eligibleCollections: true, eligibleProducts: true}})

                if (!rewardSetting) return new Response(JSON.stringify({status: "no reward setting found"}), {status: 400})
                
                if (rewardSetting.selectedRewardType === "free-shipping") {
                    rewardTitle = "Free Shipping"
                    discountCode = await createFreeShippingDiscount(rewardSetting.id, reward.store) || ""
                } else if (rewardSetting.selectedRewardType === "bxgy") {
                    const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, rewardSetting.bxgyPurchaseProductId)
                    const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, rewardSetting.bxgyReceiveProductId)

                    rewardTitle = `Buy ${rewardSetting.bxgyPurchaseAmount} ${bxgyPurchaseProductTitle} Get ${rewardSetting.bxgyReceiveAmount} ${bxgyReceiveProductTitle} ${rewardSetting.bxgyRewardType === "free" ? "Free" :
                    rewardSetting.bxgyRewardType === "dollar" ? `$${rewardSetting.bxgyDollarAmount}` : `${rewardSetting.bxgyPercentageAmount}% off`}`
                    discountCode = await createBxgyDiscount(rewardSetting.id, reward.store) || ""
                } else {
                    if (rewardSetting.selectedRewardType === "dollar") {
                        rewardTitle = `$${rewardSetting.dollarAmount} off`
                    } else if (rewardSetting.selectedRewardType === "percent") {
                        rewardTitle = `${rewardSetting.percentageAmount * 100}% off`
                    } 
                    discountCode = await createBasicDiscount(rewardSetting.id, reward.store) || ""
                }
                const minPurchaseStatement = fetchMinPurchaseRequirementStatement(rewardSetting)
                rewardTitle += minPurchaseStatement
                if (rewardSetting.productCollectionConfiguration === "all") {
                    rewardTitle += " (it is eligible for all products/collections)"
                } else if (rewardSetting.productCollectionConfiguration === "products") {
                    const eligibleProducts = await Promise.all(rewardSetting.eligibleProducts.map(async (product) => {
                        return await fetchProductTitle(reward.store, product.productId)
                    }))
                    const nonNullEligibleProducts = eligibleProducts.filter(product => product !== null)
                    rewardTitle += ` (it is eligible for the following products: ${nonNullEligibleProducts.join(', ')})`
                } else  {
                    const eligibleCollections = await Promise.all(rewardSetting.eligibleCollections.map(async (collection) => {
                        return await fetchCollectionTitle(reward.store, collection.collectionId)
                    }))
                    const nonNullEligibleCollections = eligibleCollections.filter(collection => collection !== null)
                    rewardTitle += ` (it is eligible for the following collections: ${nonNullEligibleCollections.join(', ')})`
                }
            }
        }

        // if there is a solo reward
        if (reward.type === "solo") {
            const soloReward = await db.rewardSetting.findFirst({where: {id: {equals: reward.soloId}}, include: {eligibleCollections: true, eligibleProducts: true}})

            if (!soloReward) return new Response(JSON.stringify({error: "error retrieving reward settings"}), {status: 400})

            if (soloReward.selectedRewardType === "free-shipping") {

                rewardTitle = "Free Shipping"
                discountCode = await createFreeShippingDiscount(soloReward.id, reward.store) || ""

            } else if (soloReward.selectedRewardType === "bxgy") {
                const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, soloReward.bxgyPurchaseProductId)
                const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, soloReward.bxgyReceiveProductId)

                rewardTitle = `Buy ${soloReward.bxgyPurchaseAmount}: ${bxgyPurchaseProductTitle}, Get ${soloReward.bxgyReceiveAmount}: ${bxgyReceiveProductTitle} - ${soloReward.bxgyRewardType === "free" ? "Free" :
                soloReward.bxgyRewardType === "dollar" ? `$${soloReward.bxgyDollarAmount}` : `${soloReward.bxgyPercentageAmount}%`} Off`
                
                discountCode = await createBxgyDiscount(soloReward.id, reward.store) || ""
            } else {
                if (soloReward.selectedRewardType === "dollar") {
                    rewardTitle = `$${soloReward.dollarAmount} off`

                } else if (soloReward.selectedRewardType === "percent") {
                    rewardTitle = `${soloReward.percentageAmount * 100}% off`
                } 
                discountCode = await createBasicDiscount(soloReward.id, reward.store) || ""
            } 

            const minPurchaseStatement = fetchMinPurchaseRequirementStatement(soloReward)
            rewardTitle += minPurchaseStatement
            if (soloReward.productCollectionConfiguration === "all") {
                rewardTitle += " (it is eligible for all products/collections)"
            } else if (soloReward.productCollectionConfiguration === "products") {
                const eligibleProducts = await Promise.all(soloReward.eligibleProducts.map(async (product) => {
                    return await fetchProductTitle(reward.store, product.productId)
                }))
                const nonNullEligibleProducts = eligibleProducts.filter(product => product !== null)
                rewardTitle += ` (it is eligible for the following products: ${nonNullEligibleProducts.join(', ')})`
            } else  {
                const eligibleCollections = await Promise.all(soloReward.eligibleCollections.map(async (collection) => {
                    return await fetchCollectionTitle(reward.store, collection.collectionId)
                }))
                const nonNullEligibleCollections = eligibleCollections.filter(collection => collection !== null)
                rewardTitle += ` (it is eligible for the following collections: ${nonNullEligibleCollections.join(', ')})`
            }
        }

        if (discountCode === "") return new Response(JSON.stringify({status: "error generating reward"}), {status: 401})

        const autoSendDate = new Date()
        autoSendDate.setDate(autoSendDate.getDate() + 3)
        const rewardData = {
            store: reward.store,
            title: rewardTitle, 
            code: discountCode, 
            firstName: data.firstName,
            toAddress: data.toAddress,
            autoSendDate
        }

        const pendingReward = await db.pendingReward.create({data: rewardData})
        await db.productReview.update({where: {id: data.reviewId}, data: {pendingRewardId: pendingReward.id}})

        return new Response(JSON.stringify({status: "reward successfully added to the email queue"}), {status: 200})

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({error: "something went wrong"}), {status: 400})
    }
}