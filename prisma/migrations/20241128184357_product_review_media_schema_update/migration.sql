/*
  Warnings:

  - You are about to drop the column `store` on the `ProductReviewMedia` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductReviewMedia" DROP CONSTRAINT "ProductReviewMedia_reviewId_fkey";

-- AlterTable
ALTER TABLE "ProductReviewMedia" DROP COLUMN "store";

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
