-- DropForeignKey
ALTER TABLE "CustomerQuestionAnswer" DROP CONSTRAINT "CustomerQuestionAnswer_questionId_fkey";

-- AddForeignKey
ALTER TABLE "CustomerQuestionAnswer" ADD CONSTRAINT "CustomerQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CustomerQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
