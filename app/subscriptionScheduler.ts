import { CronJob } from 'cron';
import db from './db.server'
import { DateTime } from 'luxon';

new CronJob(
  '00 * * * *', 
  async function () {
    try {
      const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}}})

      await Promise.allSettled(subscriptions.map(async (subscription) => {

        const now = DateTime.now().setZone(subscription.timezone || "UTC")
        let renewalDate = DateTime.fromJSDate(subscription.renewalDate).setZone(subscription.timezone || "UTC")

        if (now >= renewalDate) {

          // Handle missed renewals
          while (now >= renewalDate) {
            renewalDate = renewalDate.plus({ days: 30 });
          }
          
          await db.subscription.update({
            where: {id: subscription.id}, 
            data: {
              emailQuota: 50, 
              emailsSent: 0, 
              renewalDate: renewalDate.toJSDate()
            }})
        }
      }))
    } catch (error) {
      console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'UTC' // timezone
)
