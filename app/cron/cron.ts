import { CronJob } from 'cron';
import db from '../db.server';
import appUrl from '../helpers/appUrl';
import sendRewardEmail from '../helpers/rewards/sendRewardEmail.server';

// Task 1: Send Review Request Emails
async function handleReviewRequestEmails(now: Date) {
  const requestsToSend = await db.reviewRequest.findMany({ where: { isComplete: false, nextRequestDate: {lte: now} } });

  await Promise.allSettled(requestsToSend.map(async (request) => {
      await fetch(`https://${appUrl}/api/reviewRequestEmail/${request.id}/send`, {
        method: 'POST',
        body: JSON.stringify({ store: request.store }),
        headers: {"Content-Type": "application/json"}
      });
  }));
}

// Task 2: Renew Free Subscriptions
async function handleFreeSubscriptionRenewals(now: Date) {
  const newRenewalDate = new Date(now)
  newRenewalDate.setDate(newRenewalDate.getDate() + 30)

  const subscriptions = await db.subscription.findMany({ where: { type: "free", renewalDate: {lte: now} } });

  await Promise.allSettled(subscriptions.map(async (subscription) => {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          emailQuota: 50,
          emailsSent: 0,
          renewalDate: newRenewalDate,
        },
      });
  }));
}

// Task 3: Auto-Publish Product Reviews
async function handleUnpublishedReviews(now: Date) {
  const fourteenDaysAgoUTC = new Date(now)
  fourteenDaysAgoUTC.setDate(fourteenDaysAgoUTC.getDate() - 14)
  const reviews = await db.productReview.findMany({ where: 
    { 
      isPublished: false, 
      date: {lt: fourteenDaysAgoUTC},
    },
      select: {id: true}
  });

  await Promise.allSettled(reviews.map(async (review) => {
      await db.productReview.update({
        where: { id: review.id },
        data: { isPublished: true },
      });
  }));
}

// Task 4: Send Pending Reward Emails
async function handlePendingRewards(now: Date) {
  const rewardsToSend = await db.pendingReward.findMany({ where: { sent: false, autoSendDate: {lte: now} }});

  await Promise.allSettled(rewardsToSend.map(async (reward) => {
      await sendRewardEmail(reward);
  }));
}

// Combined Master Cron Job
new CronJob(
  '00 * * * *',
  async function () {
    const now = new Date()
    try {
      await Promise.allSettled([
        handleReviewRequestEmails(now),
        handleFreeSubscriptionRenewals(now),
        handleUnpublishedReviews(now),
        handlePendingRewards(now),
      ]);
    } catch (err) {
      console.error('Master cron job error:', err);
    }
  },
  null,
  true,
  'UTC'
);
