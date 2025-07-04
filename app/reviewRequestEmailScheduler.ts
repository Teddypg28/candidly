import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

// '30 8 * * *'

new CronJob(
  '49 19 * * *', 
  async function () {
    await sendReviewRequestEmails()
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
