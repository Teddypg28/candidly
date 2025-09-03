import { CronJob } from 'cron';
import db from './db.server'

new CronJob(
  '00 * * * *', 
  async function () {
    try {
      const currentDate = new Date()

      const nextBillingCycleDate = new Date(currentDate)
      nextBillingCycleDate.setDate(nextBillingCycleDate.getDate() + 30)
      const nextBillingCycleStartDate = nextBillingCycleDate

      const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}, AND: {renewalDate: {lte: currentDate}}}})
      await Promise.allSettled(subscriptions.map(async (subscription) => {
          await db.subscription.update({where: {id: subscription.id}, data: {emailQuota: 50, emailsSent: 0, renewalDate: nextBillingCycleStartDate}})
      }))
    } catch (error) {
      console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'UTC' // timezone
)
