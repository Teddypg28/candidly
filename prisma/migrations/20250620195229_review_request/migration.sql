/*
  Warnings:

  - You are about to drop the column `reviewStatus` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "reviewStatus",
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false;
