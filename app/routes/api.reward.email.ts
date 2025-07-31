import { ActionFunctionArgs } from "@remix-run/node";
import sendEmail from "~/helpers/email/sendEmail";
import { defaultCustomerRewardEmailSettings } from "~/types/types";
import db from '../db.server'
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";
import fetchRewardTierRewards from "~/helpers/rewards/fetchRewardTierRewards";
import createBxgyDiscount from "~/helpers/rewards/discountCodeMutations/createBxgyDiscount";
import createBasicDiscount from "~/helpers/rewards/discountCodeMutations/createBasicDiscount";
import createFreeShippingDiscount from "~/helpers/rewards/discountCodeMutations/createFreeShippingDiscount";
import fetchProductTitle from "~/helpers/rewards/fetchProductTitle";

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
            } else if (reward.type === "tiers") {
                const rewardTierRewardNames = await fetchRewardTierRewards(reward.id)
                rewardTitle = rewardTierRewardNames[reviewScore-1]

                const tierRewardSettingsIds = [reward.subparId, reward.goodId, reward.perfectId]
                const rewardSetting = await db.rewardSetting.findFirst({where: {id: {equals: tierRewardSettingsIds[reviewScore-1]}}})

                if (!rewardSetting) return new Response(JSON.stringify({status: "no reward setting found"}), {status: 200})
                
                if (rewardSetting.selectedRewardType === "free-shipping") {
                    rewardTitle = "Free Shipping"
                    discountCode = await createFreeShippingDiscount(rewardSetting.id, reward.store)
                } else if (rewardSetting.selectedRewardType === "bxgy") {
                    const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, rewardSetting.bxgyPurchaseProductId)
                    const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, rewardSetting.bxgyReceiveProductId)

                    rewardTitle = `Buy ${rewardSetting.bxgyPurchaseAmount} ${bxgyPurchaseProductTitle} Get ${rewardSetting.bxgyReceiveAmount} ${bxgyReceiveProductTitle} ${rewardSetting.bxgyRewardType === "free" ? "Free" :
                    rewardSetting.bxgyRewardType === "dollar" ? `$${rewardSetting.bxgyDollarAmount}` : `${rewardSetting.bxgyPercentageAmount}%`} Off Discount`
                    discountCode = await createBxgyDiscount(rewardSetting.id, reward.store)
                } else {
                    if (rewardSetting.selectedRewardType === "dollar") {
                        rewardTitle = `$${rewardSetting.dollarAmount} Off Coupon`
                    } else if (rewardSetting.selectedRewardType === "percent") {
                        rewardTitle = `${rewardSetting.percentageAmount * 100}% Off Coupon`
                    } 
                    discountCode = await createBasicDiscount(rewardSetting.id, reward.store)
                }
            }
        }

        // if there is a solo reward
        if (reward.type === "solo") {
            const soloReward = await db.rewardSetting.findFirst({where: {id: {equals: reward.soloId}}})

            if (!soloReward) return new Response(JSON.stringify({error: "error retrieving reward settings"}), {status: 400})

            if (soloReward.selectedRewardType === "free-shipping") {
                rewardTitle = "Free Shipping"
                discountCode = await createFreeShippingDiscount(soloReward.id, reward.store)
            } else if (soloReward.selectedRewardType === "bxgy") {
                const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, soloReward.bxgyPurchaseProductId)
                const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, soloReward.bxgyReceiveProductId)

                rewardTitle = `Buy ${soloReward.bxgyPurchaseAmount}: ${bxgyPurchaseProductTitle}, Get ${soloReward.bxgyReceiveAmount}: ${bxgyReceiveProductTitle} - ${soloReward.bxgyRewardType === "free" ? "Free" :
                soloReward.bxgyRewardType === "dollar" ? `$${soloReward.bxgyDollarAmount}` : `${soloReward.bxgyPercentageAmount}%`} Off`
                discountCode = await createBxgyDiscount(soloReward.id, reward.store)
            } else {
                if (soloReward.selectedRewardType === "dollar") {
                    rewardTitle = `$${soloReward.dollarAmount} Off Coupon`
                } else if (soloReward.selectedRewardType === "percent") {
                    rewardTitle = `${soloReward.percentageAmount * 100}% Off Coupon`
                } 
                discountCode = await createBasicDiscount(soloReward.id, reward.store)
            } 
        }

        const emailData = {
            reward: rewardTitle, 
            discountCode, 
            firstName: data.firstName
        }

        const emailSettings = await db.customerRewardEmailSettings.findFirst({where: {store: {equals: data.store}}})
        const appSettings = await db.appSettings.findFirst({where: {store: {equals: data.store}}})
        const emailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: data.store}}, include: {logo: {omit: {id: true, emailDesignSettingsId: true}}}})

        let fromEmailAddress = "rewards@trycandidly.app"
        const currentDomain = appSettings?.domain
        if (currentDomain) {
            const verificationStatus = await verifyRecords(currentDomain)
            if (verificationStatus === "Success") fromEmailAddress = `rewards@${currentDomain}`
        }

        await sendEmail(
            emailSettings?.subject || "Here is your reward!",
            emailSettings?.body || defaultCustomerRewardEmailSettings.body, 
            {...emailData}, 
            emailDesignSettings || {bannerBgColor: 'black', logo: null}, 
            data.toAddress, 
            fromEmailAddress,
            "customer-reward"
        )

        return new Response(JSON.stringify({status: "email successfully sent"}), {status: 200})

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({error: "something went wrong"}), {status: 400})
    }
}