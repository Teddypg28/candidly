import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

new CronJob(
  '30 08 * * *', 
  async function () {
    try {
      await sendReviewRequestEmails()
    } catch (error) {
      console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
