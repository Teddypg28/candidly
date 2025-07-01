/*
  Warnings:

  - You are about to drop the `EligibleCollection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EligibleProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RewardSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EligibleCollection" DROP CONSTRAINT "EligibleCollection_rewardSettingId_fkey";

-- DropForeignKey
ALTER TABLE "EligibleProduct" DROP CONSTRAINT "EligibleProduct_rewardSettingId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparId_fkey";

-- DropTable
DROP TABLE "EligibleCollection";

-- DropTable
DROP TABLE "EligibleProduct";

-- DropTable
DROP TABLE "Reward";

-- DropTable
DROP TABLE "RewardSetting";
