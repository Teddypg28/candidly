/*
  Warnings:

  - You are about to drop the column `goodRewardId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `perfectRewardId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `subparRewardId` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `rewardId` to the `RewardSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparRewardId_fkey";

-- DropIndex
DROP INDEX "Reward_goodRewardId_key";

-- DropIndex
DROP INDEX "Reward_perfectRewardId_key";

-- DropIndex
DROP INDEX "Reward_subparRewardId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "goodRewardId",
DROP COLUMN "perfectRewardId",
DROP COLUMN "subparRewardId";

-- AlterTable
ALTER TABLE "RewardSetting" ADD COLUMN     "rewardId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RewardSetting" ADD CONSTRAINT "RewardSetting_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
