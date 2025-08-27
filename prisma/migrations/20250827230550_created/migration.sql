/*
  Warnings:

  - You are about to drop the column `reviewId` on the `PendingReward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pendingRewardId]` on the table `ProductReview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PendingReward" DROP COLUMN "reviewId";

-- AlterTable
ALTER TABLE "ProductReview" ADD COLUMN     "pendingRewardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductReview_pendingRewardId_key" ON "ProductReview"("pendingRewardId");

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_pendingRewardId_fkey" FOREIGN KEY ("pendingRewardId") REFERENCES "PendingReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
