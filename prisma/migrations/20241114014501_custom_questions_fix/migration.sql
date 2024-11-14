/*
  Warnings:

  - Made the column `radioDisplayedAnswerLabel` on table `ReviewFormQuestion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReviewFormQuestion" ALTER COLUMN "radioDisplayedAnswerLabel" SET NOT NULL;
