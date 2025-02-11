/*
  Warnings:

  - Made the column `requestSentDate` on table `ReviewRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" ALTER COLUMN "requestSentDate" SET NOT NULL;
