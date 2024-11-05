/*
  Warnings:

  - A unique constraint covering the columns `[subparId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[goodId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perfectId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reward_subparId_key" ON "Reward"("subparId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_goodId_key" ON "Reward"("goodId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_perfectId_key" ON "Reward"("perfectId");
