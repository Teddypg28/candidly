import { CronJob } from 'cron';

const job = new CronJob(
  '30 8 * * *', 
  function () {
    console.log('This script ran at 7:45 PM')
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
