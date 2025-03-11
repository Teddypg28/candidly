/*
  Warnings:

  - You are about to drop the column `rewardId` on the `ExcludedProduct` table. All the data in the column will be lost.
  - Added the required column `rewardSettingId` to the `ExcludedProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExcludedProduct" DROP CONSTRAINT "ExcludedProduct_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparId_fkey";

-- AlterTable
ALTER TABLE "ExcludedProduct" DROP COLUMN "rewardId",
ADD COLUMN     "rewardSettingId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ExcludedProduct" ADD CONSTRAINT "ExcludedProduct_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
