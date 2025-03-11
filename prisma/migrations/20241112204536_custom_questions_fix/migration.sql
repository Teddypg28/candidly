/*
  Warnings:

  - The `answerType` column on the `ReviewFormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `RadioAnswerSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TextAnswerSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `radioAllowMultipleAnswers` to the `ReviewFormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radioDisplayAnswer` to the `ReviewFormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RadioAnswerSettings" DROP CONSTRAINT "RadioAnswerSettings_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TextAnswerSettings" DROP CONSTRAINT "TextAnswerSettings_questionId_fkey";

-- AlterTable
ALTER TABLE "ReviewFormQuestion" ADD COLUMN     "radioAllowMultipleAnswers" BOOLEAN NOT NULL,
ADD COLUMN     "radioAnswerChoices" TEXT[],
ADD COLUMN     "radioDisplayAnswer" BOOLEAN NOT NULL,
ADD COLUMN     "radioDisplayedAnswerLabel" TEXT,
DROP COLUMN "answerType",
ADD COLUMN     "answerType" TEXT[];

-- DropTable
DROP TABLE "RadioAnswerSettings";

-- DropTable
DROP TABLE "TextAnswerSettings";
