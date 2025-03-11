/*
  Warnings:

  - Added the required column `reviewId` to the `TextAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TextAnswer" ADD COLUMN     "reviewId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TextAnswer" ADD CONSTRAINT "TextAnswer_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
