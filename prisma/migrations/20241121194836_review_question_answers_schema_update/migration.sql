-- DropForeignKey
ALTER TABLE "AnswerChoiceSnapshot" DROP CONSTRAINT "AnswerChoiceSnapshot_reviewId_fkey";

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
