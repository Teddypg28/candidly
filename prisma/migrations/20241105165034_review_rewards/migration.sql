/*
  Warnings:

  - You are about to drop the column `rewardId` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `RewardSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RewardSetting" DROP COLUMN "rewardId",
DROP COLUMN "type";
