import { CronJob } from 'cron';
import sendReviewRequestEmails from './sendReviewRequestEmails.server';

// '30 8 * * *'

const job = new CronJob(
  '43 00 * * *', 
  async function () {

    console.log('cron job started!')
    
    await sendReviewRequestEmails()

  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
