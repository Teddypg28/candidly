/*
  Warnings:

  - Made the column `minPurchaseType` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RewardSetting" ALTER COLUMN "minPurchaseType" SET NOT NULL,
ALTER COLUMN "minPurchaseType" DROP DEFAULT;
