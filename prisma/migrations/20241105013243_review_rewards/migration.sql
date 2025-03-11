/*
  Warnings:

  - You are about to drop the column `goodId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `perfectId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `subparId` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `rewardId` to the `RewardSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `RewardSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparId_fkey";

-- DropIndex
DROP INDEX "Reward_goodId_key";

-- DropIndex
DROP INDEX "Reward_perfectId_key";

-- DropIndex
DROP INDEX "Reward_subparId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "goodId",
DROP COLUMN "perfectId",
DROP COLUMN "subparId";

-- AlterTable
ALTER TABLE "RewardSetting" ADD COLUMN     "rewardId" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RewardSetting" ADD CONSTRAINT "RewardSetting_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
