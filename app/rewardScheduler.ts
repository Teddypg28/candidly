import { CronJob } from 'cron';
import db from './db.server'
import sendRewardEmail from './helpers/rewards/sendRewardEmail.server';
import { DateTime } from 'luxon';

new CronJob(
  '00 * * * *', 
  async function () {
    try {     
        const pendingRewards = await db.pendingReward.findMany({where: {sent: {equals: false}}})
        await Promise.allSettled(pendingRewards.map(async (reward) => {
            const autoSendDate = DateTime.fromJSDate(reward.autoSendDate)
            const now = DateTime.now().setZone(reward.timezone || "America/Chicago").toUTC()
            if (autoSendDate < now) {
              await sendRewardEmail(reward)
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
