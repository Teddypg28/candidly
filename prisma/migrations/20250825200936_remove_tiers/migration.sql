/*
  Warnings:

  - You are about to drop the column `rewardSettingId` on the `EligibleCollection` table. All the data in the column will be lost.
  - You are about to drop the column `rewardSettingId` on the `EligibleProduct` table. All the data in the column will be lost.
  - You are about to drop the column `rewardId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `store` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `RewardSetting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rewardId` to the `EligibleCollection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardId` to the `EligibleProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyDollarAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyPercentageAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyPurchaseAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyPurchaseProductId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyReceiveAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyReceiveProductId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bxgyRewardType` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dollarAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPurchaseDollarValue` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPurchaseQuantityValue` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPurchaseType` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentageAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedRewardType` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EligibleCollection" DROP CONSTRAINT "EligibleCollection_rewardSettingId_fkey";

-- DropForeignKey
ALTER TABLE "EligibleProduct" DROP CONSTRAINT "EligibleProduct_rewardSettingId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_rewardId_fkey";

-- DropIndex
DROP INDEX "Reward_rewardId_key";

-- AlterTable
ALTER TABLE "EligibleCollection" DROP COLUMN "rewardSettingId",
ADD COLUMN     "rewardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EligibleProduct" DROP COLUMN "rewardSettingId",
ADD COLUMN     "rewardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "rewardId",
DROP COLUMN "store",
DROP COLUMN "type",
ADD COLUMN     "bxgyDollarAmount" INTEGER NOT NULL,
ADD COLUMN     "bxgyPercentageAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bxgyPurchaseAmount" INTEGER NOT NULL,
ADD COLUMN     "bxgyPurchaseProductId" TEXT NOT NULL,
ADD COLUMN     "bxgyReceiveAmount" INTEGER NOT NULL,
ADD COLUMN     "bxgyReceiveProductId" TEXT NOT NULL,
ADD COLUMN     "bxgyRewardType" TEXT NOT NULL,
ADD COLUMN     "dollarAmount" INTEGER NOT NULL,
ADD COLUMN     "minPurchaseDollarValue" INTEGER NOT NULL,
ADD COLUMN     "minPurchaseQuantityValue" INTEGER NOT NULL,
ADD COLUMN     "minPurchaseType" TEXT NOT NULL,
ADD COLUMN     "percentageAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "productCollectionConfiguration" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN     "selectedRewardType" TEXT NOT NULL;

-- DropTable
DROP TABLE "RewardSetting";

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibleCollection" ADD CONSTRAINT "EligibleCollection_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
