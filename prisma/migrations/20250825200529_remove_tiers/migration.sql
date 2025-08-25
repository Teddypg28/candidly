/*
  Warnings:

  - You are about to drop the column `goodId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `perfectId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `soloId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `subparId` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rewardId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rewardId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_soloId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparId_fkey";

-- DropIndex
DROP INDEX "Reward_goodId_key";

-- DropIndex
DROP INDEX "Reward_perfectId_key";

-- DropIndex
DROP INDEX "Reward_soloId_key";

-- DropIndex
DROP INDEX "Reward_subparId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "goodId",
DROP COLUMN "perfectId",
DROP COLUMN "soloId",
DROP COLUMN "subparId",
ADD COLUMN     "rewardId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_rewardId_key" ON "Reward"("rewardId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
