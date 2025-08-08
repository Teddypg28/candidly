import { CronJob } from 'cron';
import db from './db.server'

new CronJob(
  '00 00 * * *', 
  async function () {
    const currentDate = new Date()
    const nextBillingCycleStartDate = new Date(currentDate.setDate(currentDate.getDate() + 30)).toLocaleDateString()
    const currentDateString = currentDate.toLocaleDateString()
    const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}, AND: {renewalDate: {equals: currentDateString}}}})
    await Promise.all(subscriptions.map(async (subscription) => {
        await db.subscription.update({where: {id: subscription.id}, data: {emailQuota: 50, emailsSent: 0, renewalDate: nextBillingCycleStartDate}})
    }))
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
