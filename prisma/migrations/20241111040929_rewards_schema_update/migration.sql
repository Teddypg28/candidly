/*
  Warnings:

  - You are about to drop the column `date` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestDate` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `rewardId` on the `RewardSetting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subparId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[goodId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perfectId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goodId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfectId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subparId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RewardSetting" DROP CONSTRAINT "RewardSetting_rewardId_fkey";

-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "date",
DROP COLUMN "requestDate",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "requestSentDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "goodId" INTEGER NOT NULL,
ADD COLUMN     "perfectId" INTEGER NOT NULL,
ADD COLUMN     "subparId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RewardSetting" DROP COLUMN "rewardId";

-- CreateIndex
CREATE UNIQUE INDEX "Reward_subparId_key" ON "Reward"("subparId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_goodId_key" ON "Reward"("goodId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_perfectId_key" ON "Reward"("perfectId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
