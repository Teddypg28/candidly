/*
  Warnings:

  - You are about to drop the column `bogoDollarAmount` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoPercentageAmount` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoPurchaseAmount` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoPurchaseProductId` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoReceiveAmount` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoReceiveProductId` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `bogoRewardType` on the `RewardSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RewardSetting" DROP COLUMN "bogoDollarAmount",
DROP COLUMN "bogoPercentageAmount",
DROP COLUMN "bogoPurchaseAmount",
DROP COLUMN "bogoPurchaseProductId",
DROP COLUMN "bogoReceiveAmount",
DROP COLUMN "bogoReceiveProductId",
DROP COLUMN "bogoRewardType",
ADD COLUMN     "bxgyDollarAmount" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "bxgyPercentageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
ADD COLUMN     "bxgyPurchaseAmount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "bxgyPurchaseProductId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bxgyReceiveAmount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "bxgyReceiveProductId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bxgyRewardType" TEXT NOT NULL DEFAULT 'free-shipping';
