/*
  Warnings:

  - You are about to drop the column `sameId` on the `Reward` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[soloId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_sameId_fkey";

-- DropIndex
DROP INDEX "Reward_sameId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "sameId",
ADD COLUMN     "soloId" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Reward_soloId_key" ON "Reward"("soloId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_soloId_fkey" FOREIGN KEY ("soloId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
