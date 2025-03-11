/*
  Warnings:

  - Added the required column `followUpEmailBody` to the `ReviewRequestEmailSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialEmailBody` to the `ReviewRequestEmailSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" ADD COLUMN     "followUpEmailBody" TEXT NOT NULL,
ADD COLUMN     "initialEmailBody" TEXT NOT NULL;
