/*
  Warnings:

  - You are about to drop the column `emailsSent` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "emailsSent",
ADD COLUMN     "emailsLeft" INTEGER NOT NULL DEFAULT 50;
