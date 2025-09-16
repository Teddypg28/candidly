import db from '../db.server'
import { free } from './subscriptionData/emailQuotaVariables'

export default async function cancelSubscription(shop: string) {
    const currentSubscription = await db.subscription.findFirst({where: {shop}})

    if (currentSubscription && currentSubscription.type !== "free") {
        const renewalDate = new Date(currentSubscription.renewalDate)
        const isoStringRenewalDate = renewalDate.toISOString()
    
        const currentDate = new Date()
        const isoStringCurrentDate = currentDate.toISOString()
    
        const daysLeftInCycle = Math.max(0, Math.round((new Date(isoStringRenewalDate).getTime() - new Date(isoStringCurrentDate).getTime()) / (1000 * 60 * 60 * 24)))
        const daysUsed = 30 - daysLeftInCycle
    
        const paidQuotaSoFar = currentSubscription.emailQuota
        const newEmailQuota = free
        const updatedEmailQuota = newEmailQuota + ((paidQuotaSoFar - newEmailQuota) * (daysUsed/30))
    
        await db.subscription.update({where: {id: currentSubscription.id}, data: {type: "free", emailQuota: updatedEmailQuota}})
    }
}