-- DropForeignKey
ALTER TABLE "ProductReview" DROP CONSTRAINT "ProductReview_pendingRewardId_fkey";

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_pendingRewardId_fkey" FOREIGN KEY ("pendingRewardId") REFERENCES "PendingReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
