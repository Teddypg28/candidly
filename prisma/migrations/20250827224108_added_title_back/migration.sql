/*
  Warnings:

  - Added the required column `title` to the `PendingReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingReward" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "autoSendDate" SET DEFAULT '';
