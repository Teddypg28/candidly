/*
  Warnings:

  - Changed the type of `autoSendDate` on the `PendingReward` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PendingReward" DROP COLUMN "autoSendDate",
ADD COLUMN     "autoSendDate" TIMESTAMP(3) NOT NULL;
