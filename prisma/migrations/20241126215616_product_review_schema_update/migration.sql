/*
  Warnings:

  - You are about to drop the column `media` on the `ProductReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductReview" DROP COLUMN "media";

-- CreateTable
CREATE TABLE "ProductReviewMedia" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "ProductReviewMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
