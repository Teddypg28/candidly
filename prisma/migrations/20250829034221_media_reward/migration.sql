/*
  Warnings:

  - You are about to drop the column `soloId` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mediaId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mediaId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_soloId_fkey";

-- DropIndex
DROP INDEX "Reward_soloId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "soloId",
ADD COLUMN     "mediaId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_mediaId_key" ON "Reward"("mediaId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
