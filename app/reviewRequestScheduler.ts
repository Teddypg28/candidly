import { CronJob } from 'cron';
import sendReviewRequestEmails from './helpers/sendReviewRequestEmails.server';

new CronJob(
  '31 20 * * *', 
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
