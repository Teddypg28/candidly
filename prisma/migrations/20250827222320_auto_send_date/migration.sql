/*
  Warnings:

  - You are about to drop the column `dateCreated` on the `PendingReward` table. All the data in the column will be lost.
  - Added the required column `autoSendDate` to the `PendingReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingReward" DROP COLUMN "dateCreated",
ADD COLUMN     "autoSendDate" TEXT NOT NULL;
