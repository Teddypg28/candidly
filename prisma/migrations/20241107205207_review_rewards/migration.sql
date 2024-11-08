/*
  Warnings:

  - You are about to drop the column `productIds` on the `Reward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "productIds";

-- CreateTable
CREATE TABLE "EligibleProduct" (
    "id" SERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "variantIds" BIGINT[],
    "rewardId" INTEGER NOT NULL,

    CONSTRAINT "EligibleProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
