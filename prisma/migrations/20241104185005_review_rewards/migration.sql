/*
  Warnings:

  - You are about to drop the column `rewardId` on the `RewardSettings` table. All the data in the column will be lost.
  - You are about to drop the `ReviewReward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `goodId` to the `RewardSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfectId` to the `RewardSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subparId` to the `RewardSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RewardSettings" DROP CONSTRAINT "RewardSettings_rewardId_fkey";

-- AlterTable
ALTER TABLE "RewardSettings" DROP COLUMN "rewardId",
ADD COLUMN     "goodId" INTEGER NOT NULL,
ADD COLUMN     "perfectId" INTEGER NOT NULL,
ADD COLUMN     "subparId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ReviewReward";

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RewardSettings" ADD CONSTRAINT "RewardSettings_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardSettings" ADD CONSTRAINT "RewardSettings_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardSettings" ADD CONSTRAINT "RewardSettings_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
