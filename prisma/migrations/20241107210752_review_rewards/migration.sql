/*
  Warnings:

  - Made the column `fixedAmount` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `percentageAmount` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bogoRewardType` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bogoPurchaseAmount` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bogoReceiveAmount` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bogoDiscountAmount` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minPurchaseType` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minPurchaseDollarValue` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minPurchaseQuantityValue` on table `RewardSetting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RewardSetting" ALTER COLUMN "fixedAmount" SET NOT NULL,
ALTER COLUMN "percentageAmount" SET NOT NULL,
ALTER COLUMN "bogoRewardType" SET NOT NULL,
ALTER COLUMN "bogoPurchaseAmount" SET NOT NULL,
ALTER COLUMN "bogoReceiveAmount" SET NOT NULL,
ALTER COLUMN "bogoDiscountAmount" SET NOT NULL,
ALTER COLUMN "minPurchaseType" SET NOT NULL,
ALTER COLUMN "minPurchaseDollarValue" SET NOT NULL,
ALTER COLUMN "minPurchaseQuantityValue" SET NOT NULL;
