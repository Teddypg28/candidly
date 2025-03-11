/*
  Warnings:

  - Added the required column `questionId` to the `CustomQuestionAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomQuestionAnswer" ADD COLUMN     "questionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomQuestionAnswer" ADD CONSTRAINT "CustomQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
