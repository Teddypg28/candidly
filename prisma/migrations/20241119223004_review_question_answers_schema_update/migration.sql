/*
  Warnings:

  - You are about to drop the column `radioAnswerChoices` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the `CustomQuestionAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomQuestionAnswer" DROP CONSTRAINT "CustomQuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "CustomQuestionAnswer" DROP CONSTRAINT "CustomQuestionAnswer_reviewId_fkey";

-- AlterTable
ALTER TABLE "ReviewFormQuestion" DROP COLUMN "radioAnswerChoices";

-- DropTable
DROP TABLE "CustomQuestionAnswer";

-- CreateTable
CREATE TABLE "radioAnswerChoice" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "radioAnswerChoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "radioAnswerChoice" ADD CONSTRAINT "radioAnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radioAnswerChoice" ADD CONSTRAINT "radioAnswerChoice_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
