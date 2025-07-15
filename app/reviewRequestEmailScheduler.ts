import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

// '30 8 * * *'

new CronJob(
  '32 00 * * *', 
  async function () {
    await sendReviewRequestEmails()
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
