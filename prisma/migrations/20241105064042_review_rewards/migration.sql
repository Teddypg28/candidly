/*
  Warnings:

  - A unique constraint covering the columns `[subparRewardId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[goodRewardId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perfectRewardId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `goodRewardId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfectRewardId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subparRewardId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RewardSetting" DROP CONSTRAINT "RewardSetting_rewardId_fkey";

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "goodRewardId" INTEGER NOT NULL,
ADD COLUMN     "perfectRewardId" INTEGER NOT NULL,
ADD COLUMN     "subparRewardId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_subparRewardId_key" ON "Reward"("subparRewardId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_goodRewardId_key" ON "Reward"("goodRewardId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_perfectRewardId_key" ON "Reward"("perfectRewardId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparRewardId_fkey" FOREIGN KEY ("subparRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodRewardId_fkey" FOREIGN KEY ("goodRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectRewardId_fkey" FOREIGN KEY ("perfectRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
