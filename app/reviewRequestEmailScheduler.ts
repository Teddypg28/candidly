import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

new CronJob(
  '06 19 * * *', 
  async function () {
    await sendReviewRequestEmails()
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
