/*
  Warnings:

  - You are about to drop the column `pageNumber` on the `SavedReviewsTableViews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SavedReviewsTableViews" DROP COLUMN "pageNumber";

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
