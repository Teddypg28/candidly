import { CronJob } from 'cron';
import db from './db.server'
import { DateTime } from 'luxon';

new CronJob(
  '00 * * * *', 
  async function () {
    try {     
        const unpublishedReviews = await db.productReview.findMany({where: {isPublished: {equals: false}}})

        const jobs = unpublishedReviews.map(async (review) => {

          const reviewDate = DateTime.fromJSDate(review.date).setZone(review.timezone || "UTC")
          const now = DateTime.now().setZone(review.timezone || "UTC")
          const fourteenDaysAgo = now.minus({days: 14})

          if (reviewDate < fourteenDaysAgo) {
            await db.productReview.update({where: {id: review.id}, data: {isPublished: true}})
          }

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
