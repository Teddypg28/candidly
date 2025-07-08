/*
  Warnings:

  - You are about to drop the column `selectedIsAnsweredFilter` on the `SavedQuestionAnswerTableView` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SavedQuestionAnswerTableView" DROP COLUMN "selectedIsAnsweredFilter",
ADD COLUMN     "selectedAnswerStatusFilter" TEXT[];
