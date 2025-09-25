import { PendingReward } from '@prisma/client'
import db from '../../db.server'
import { defaultCustomerRewardEmailSettings } from '~/types/types'
import sendEmail from '../email/sendEmail'

export default async function sendRewardEmail(pendingReward: PendingReward) {
    try {      
        const emailSettings = await db.customerRewardEmailSettings.findFirst({where: {store: {equals: pendingReward.store}}})
        const emailDesignSettings = await db.emailDesignSettings.findFirst({where: {store: {equals: pendingReward.store}}, include: {logo: {omit: {id: true, emailDesignSettingsId: true}}}})

    await sendEmail(
        emailSettings?.subject || `Here is your reward, ${pendingReward.firstName}!`,
        emailSettings?.body || defaultCustomerRewardEmailSettings.body, 
        {reward: pendingReward.title, discountCode: pendingReward.code, firstName: pendingReward.firstName}, 
        emailDesignSettings || {bannerBgColor: 'black', logo: null}, 
        pendingReward.toAddress, 
        "rewards@trycandidly.app",
        "customer-reward"
    )

    await db.pendingReward.update({where: {id: pendingReward.id}, data: {sent: true}})

    } catch (error) {
        console.error(error)
    }
}
