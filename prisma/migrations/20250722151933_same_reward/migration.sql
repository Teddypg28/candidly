/*
  Warnings:

  - A unique constraint covering the columns `[sameId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "sameId" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE "RewardSettings" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "RewardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_sameId_key" ON "Reward"("sameId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_sameId_fkey" FOREIGN KEY ("sameId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
