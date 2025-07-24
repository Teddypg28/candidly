/*
  Warnings:

  - You are about to drop the column `sameRewardValue` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sameId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sameId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "sameRewardValue",
ADD COLUMN     "sameId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_sameId_key" ON "Reward"("sameId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_sameId_fkey" FOREIGN KEY ("sameId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
