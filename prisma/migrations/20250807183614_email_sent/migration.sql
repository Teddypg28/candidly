/*
  Warnings:

  - You are about to drop the column `emailsLeft` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "emailsLeft",
ADD COLUMN     "emailQuota" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "emailsSent" INTEGER NOT NULL DEFAULT 0;
