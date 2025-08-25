import { ActionFunctionArgs } from "@remix-run/node";
import sendEmail from "~/helpers/email/sendEmail";
import { defaultCustomerRewardEmailSettings } from "~/types/types";
import db from '../db.server'
import { verifyRecords } from "~/helpers/domainVerification/verifyRecords";
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

        const reward = await db.reward.findFirst({where: {id: {equals: data.rewardSettingsId}}, include: {eligibleCollections: true, eligibleProducts: true}})
        if (!reward) return new Response(JSON.stringify({error: "no reward settings found"}), {status: 400})

        // if rewards are disabled
        if (reward.disabled) return new Response(JSON.stringify({status: "rewards disabled"}), {status: 200})
        
        if (reward.selectedRewardType === "free-shipping") {

            rewardTitle = "Free Shipping"
            discountCode = await createFreeShippingDiscount(reward.id, reward.store) || ""

        } else if (reward.selectedRewardType === "bxgy") {
            const bxgyPurchaseProductTitle = await fetchProductTitle(reward.store, reward.bxgyPurchaseProductId)
            const bxgyReceiveProductTitle = await fetchProductTitle(reward.store, reward.bxgyReceiveProductId)

            rewardTitle = `Buy ${reward.bxgyPurchaseAmount} ${bxgyPurchaseProductTitle}, Get ${reward.bxgyReceiveAmount} ${bxgyReceiveProductTitle} - ${reward.bxgyRewardType === "free" ? "Free" :
            reward.bxgyRewardType === "dollar" ? `$${reward.bxgyDollarAmount}` : `${reward.bxgyPercentageAmount * 100}%`} Off`
            
            discountCode = await createBxgyDiscount(reward.id, reward.store) || ""
        } else {
            if (reward.selectedRewardType === "dollar") {
                rewardTitle = `$${reward.dollarAmount} off`

            } else if (reward.selectedRewardType === "percent") {
                rewardTitle = `${reward.percentageAmount * 100}% off`
            } 
            discountCode = await createBasicDiscount(reward.id, reward.store) || ""
        } 

        const minPurchaseStatement = fetchMinPurchaseRequirementStatement(reward)
        rewardTitle += minPurchaseStatement
        if (reward.selectedRewardType !== 'bxgy') {
            if (reward.productCollectionConfiguration === "all") {
                rewardTitle += " (it is eligible for all products/collections)"
            } else if (reward.productCollectionConfiguration === "products") {
                const eligibleProducts = await Promise.all(reward.eligibleProducts.map(async (product) => {
                    return await fetchProductTitle(reward.store, product.productId)
                }))
                const nonNullEligibleProducts = eligibleProducts.filter(product => product !== null)
                rewardTitle += ` (it is eligible for the following products: ${nonNullEligibleProducts.join(', ')})`
            } else  {
                const eligibleCollections = await Promise.all(reward.eligibleCollections.map(async (collection) => {
                    return await fetchCollectionTitle(reward.store, collection.collectionId)
                }))
                const nonNullEligibleCollections = eligibleCollections.filter(collection => collection !== null)
                rewardTitle += ` (it is eligible for the following collections: ${nonNullEligibleCollections.join(', ')})`
            }
        }

    if (discountCode === "") return new Response(JSON.stringify({status: "error generating reward"}), {status: 401})

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