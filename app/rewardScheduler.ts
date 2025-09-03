import { CronJob } from 'cron';
import db from './db.server'
import sendRewardEmail from './helpers/rewards/sendRewardEmail.server';

new CronJob(
  '00 * * * *', 
  async function () {
    try {     
        const pendingRewards = await db.pendingReward.findMany({where: {autoSendDate: {lte: new Date()}, sent: {equals: false}}})
        await Promise.allSettled(pendingRewards.map(async (reward) => {
            await sendRewardEmail(reward)
        }))
    } catch (error) {
        console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'UTC' // timezone
)
