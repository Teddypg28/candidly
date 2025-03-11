/*
  Warnings:

  - You are about to drop the column `reviewId` on the `RadioAnswerChoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RadioAnswerChoice" DROP CONSTRAINT "RadioAnswerChoice_reviewId_fkey";

-- AlterTable
ALTER TABLE "RadioAnswerChoice" DROP COLUMN "reviewId";

-- CreateTable
CREATE TABLE "_ProductReviewToRadioAnswerChoice" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductReviewToRadioAnswerChoice_AB_unique" ON "_ProductReviewToRadioAnswerChoice"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductReviewToRadioAnswerChoice_B_index" ON "_ProductReviewToRadioAnswerChoice"("B");

-- AddForeignKey
ALTER TABLE "_ProductReviewToRadioAnswerChoice" ADD CONSTRAINT "_ProductReviewToRadioAnswerChoice_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductReviewToRadioAnswerChoice" ADD CONSTRAINT "_ProductReviewToRadioAnswerChoice_B_fkey" FOREIGN KEY ("B") REFERENCES "RadioAnswerChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
