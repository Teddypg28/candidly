import { CronJob } from 'cron';
import db from './db.server'

new CronJob(
  '00 05 * * *', 
  async function () {
    try {
      const currentDate = new Date()
      const nextBillingCycleStartDate = new Date(currentDate.setDate(currentDate.getDate() + 30)).toLocaleDateString()
      const currentDateString = currentDate.toLocaleDateString()
      const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}, AND: {renewalDate: {equals: currentDateString}}}})
      await Promise.allSettled(subscriptions.map(async (subscription) => {
          await db.subscription.update({where: {id: subscription.id}, data: {emailQuota: 50, emailsSent: 0, renewalDate: nextBillingCycleStartDate}})
      }))
    } catch (error) {
      console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
