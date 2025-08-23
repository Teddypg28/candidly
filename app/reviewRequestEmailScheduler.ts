import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

new CronJob(
  '09 21 * * *', 
  async function () {
    await sendReviewRequestEmails()
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
