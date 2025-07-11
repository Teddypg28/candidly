/*
  Warnings:

  - You are about to drop the `Subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" ALTER COLUMN "subject" DROP DEFAULT;

-- DropTable
DROP TABLE "Subscriptions";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
