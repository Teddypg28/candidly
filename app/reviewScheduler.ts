import { CronJob } from 'cron';
import db from './db.server'

new CronJob(
  '00 05 * * *', 
  async function () {
    try {     
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
        const productReviewsNeedToBePublished = await db.productReview.findMany({
        where: {
            isPublished: false,
            date: {
                lt: fourteenDaysAgo
            }
        }
        });
    
        await Promise.allSettled(productReviewsNeedToBePublished.map(async (review) => {
            await db.productReview.update({where: {id: review.id}, data: {isPublished: true}})
        }))
    } catch (error) {
        console.error(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'America/Chicago' // timezone
)
