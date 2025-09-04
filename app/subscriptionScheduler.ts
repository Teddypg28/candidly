import { CronJob } from 'cron';
import db from './db.server'
import { DateTime } from 'luxon';

new CronJob(
  '00 * * * *', 
  async function () {
    try {
      const subscriptions = await db.subscription.findMany({where: {type: {equals: "free"}}})

      await Promise.allSettled(subscriptions.map(async (subscription) => {

        const now = DateTime.now().setZone(subscription.timezone || "America/Chicago").toUTC()
        const subRenewalDate = DateTime.fromJSDate(subscription.renewalDate)

        if (now >= subRenewalDate) {
          const nextBillingCycleDate = subRenewalDate.plus({ months: 1 });
          await db.subscription.update({
            where: {id: subscription.id}, 
            data: {
              emailQuota: 50, 
              emailsSent: 0, 
              renewalDate: nextBillingCycleDate.toJSDate()
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
