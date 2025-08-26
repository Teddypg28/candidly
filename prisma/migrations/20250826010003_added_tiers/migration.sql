/*
  Warnings:

  - You are about to drop the column `rewardId` on the `EligibleCollection` table. All the data in the column will be lost.
  - You are about to drop the column `rewardId` on the `EligibleProduct` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyDollarAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyPercentageAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyPurchaseAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyPurchaseProductId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyReceiveAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyReceiveProductId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `bxgyRewardType` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `dollarAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `minPurchaseDollarValue` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `minPurchaseQuantityValue` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `minPurchaseType` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `percentageAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `productCollectionConfiguration` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `selectedRewardType` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subparId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[goodId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perfectId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[soloId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rewardSettingId` to the `EligibleCollection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardSettingId` to the `EligibleProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goodId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfectId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `soloId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subparId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EligibleCollection" DROP CONSTRAINT "EligibleCollection_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "EligibleProduct" DROP CONSTRAINT "EligibleProduct_rewardId_fkey";

-- AlterTable
ALTER TABLE "EligibleCollection" DROP COLUMN "rewardId",
ADD COLUMN     "rewardSettingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EligibleProduct" DROP COLUMN "rewardId",
ADD COLUMN     "rewardSettingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "bxgyDollarAmount",
DROP COLUMN "bxgyPercentageAmount",
DROP COLUMN "bxgyPurchaseAmount",
DROP COLUMN "bxgyPurchaseProductId",
DROP COLUMN "bxgyReceiveAmount",
DROP COLUMN "bxgyReceiveProductId",
DROP COLUMN "bxgyRewardType",
DROP COLUMN "disabled",
DROP COLUMN "dollarAmount",
DROP COLUMN "minPurchaseDollarValue",
DROP COLUMN "minPurchaseQuantityValue",
DROP COLUMN "minPurchaseType",
DROP COLUMN "percentageAmount",
DROP COLUMN "productCollectionConfiguration",
DROP COLUMN "selectedRewardType",
ADD COLUMN     "goodId" TEXT NOT NULL,
ADD COLUMN     "perfectId" TEXT NOT NULL,
ADD COLUMN     "soloId" TEXT NOT NULL,
ADD COLUMN     "subparId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RewardSetting" (
    "id" TEXT NOT NULL,
    "selectedRewardType" TEXT NOT NULL,
    "dollarAmount" INTEGER NOT NULL,
    "percentageAmount" DOUBLE PRECISION NOT NULL,
    "bxgyRewardType" TEXT NOT NULL,
    "bxgyPurchaseAmount" INTEGER NOT NULL,
    "bxgyReceiveAmount" INTEGER NOT NULL,
    "bxgyPercentageAmount" DOUBLE PRECISION NOT NULL,
    "bxgyDollarAmount" INTEGER NOT NULL,
    "bxgyPurchaseProductId" TEXT NOT NULL,
    "bxgyReceiveProductId" TEXT NOT NULL,
    "minPurchaseType" TEXT NOT NULL,
    "minPurchaseDollarValue" INTEGER NOT NULL,
    "minPurchaseQuantityValue" INTEGER NOT NULL,
    "productCollectionConfiguration" TEXT NOT NULL DEFAULT 'all',

    CONSTRAINT "RewardSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_subparId_key" ON "Reward"("subparId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_goodId_key" ON "Reward"("goodId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_perfectId_key" ON "Reward"("perfectId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_soloId_key" ON "Reward"("soloId");

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibleCollection" ADD CONSTRAINT "EligibleCollection_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_soloId_fkey" FOREIGN KEY ("soloId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
