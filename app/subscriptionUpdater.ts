import { CronJob } from 'cron';
import db from './db.server'

// '30 8 * * *'

new CronJob(
  '32 00 * * *', 
  async function () {
    const currentDate = new Date()
    const oneMonthFromToday = new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toLocaleDateString()
    const currentDateString = currentDate.toLocaleDateString()
    const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}, AND: {renewalDate: {equals: currentDateString}}}})
    await Promise.all(subscriptions.map(async (subscription) => {
        await db.subscription.update({where: {id: subscription.id}, data: {emailQuota: 50, emailsSent: 0, renewalDate: oneMonthFromToday}})
    }))
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
