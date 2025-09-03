import { CronJob } from 'cron';
import db from './db.server'

new CronJob(
  '00 * * * *', 
  async function () {
    try {     
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
        const unpublishedReviews = await db.productReview.findMany({where: {isPublished: {equals: false}, date: {lte: fourteenDaysAgo}}})

        const jobs = unpublishedReviews.map(async (review) => {
          await db.productReview.update({where: {id: review.id}, data: {isPublished: true}})
        })
        
        await Promise.allSettled(jobs)
    } catch (error) {
        console.error(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'UTC' // timezone
)
