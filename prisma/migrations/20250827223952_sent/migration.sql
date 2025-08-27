/*
  Warnings:

  - You are about to drop the column `title` on the `PendingReward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PendingReward" DROP COLUMN "title",
ADD COLUMN     "sent" BOOLEAN NOT NULL DEFAULT false;
