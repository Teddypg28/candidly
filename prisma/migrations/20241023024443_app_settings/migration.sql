/*
  Warnings:

  - You are about to drop the column `daysToWaitFirst` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `daysToWaitSecond` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "daysToWaitFirst",
DROP COLUMN "daysToWaitSecond";
