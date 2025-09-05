import { CronJob } from 'cron';
import appUrl from  '../app/helpers/appUrl'
import db from './db.server'
import { DateTime } from 'luxon';

new CronJob(
  '00 * * * *', 
  async function () {
    try {
      const incompleteReviewRequests = await db.reviewRequest.findMany({where: {isComplete: {equals: false}}})

      const jobs = incompleteReviewRequests.map(async (request) => {

        const now = DateTime.now().setZone(request.timezone || "UTC")
        const nowIso = now.toISODate();

        const requestDate = DateTime.fromJSDate(request.nextRequestDate as Date).setZone(request.timezone || "UTC")
        const requestDateIso = requestDate.toISODate();
        
        if (nowIso === requestDateIso && now.hour === 10) {
          await fetch(`https://${appUrl}/api/reviewRequestEmail/${request.id}/send`, {method: 'POST', body: JSON.stringify({store: request.store})})
        }
        
      })
      await Promise.allSettled(jobs)

    } catch (error) {
      console.log(error)
    }
  },
  null, // optional onComplete callback if needed
  true, // start immediately
  'UTC' // timezone
)

