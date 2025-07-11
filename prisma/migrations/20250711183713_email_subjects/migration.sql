/*
  Warnings:

  - You are about to drop the column `subject` on the `ReviewRequestEmailSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" DROP COLUMN "subject",
ADD COLUMN     "followUpEmailSubject" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "initialEmailSubject" TEXT NOT NULL DEFAULT '';
