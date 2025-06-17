import { CronJob } from 'cron';
import db from './db.server'

const job = new CronJob(
  '30 8 * * *', 
  async function () {
    
    const todayScheduledReviewRequests = await db.reviewRequest.findMany({where: {nextRequestDate: {equals: new Date()}}})

    

  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
