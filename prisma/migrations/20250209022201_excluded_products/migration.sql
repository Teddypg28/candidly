/*
  Warnings:

  - You are about to drop the `EligibleProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EligibleProduct" DROP CONSTRAINT "EligibleProduct_rewardId_fkey";

-- DropTable
DROP TABLE "EligibleProduct";

-- CreateTable
CREATE TABLE "ExcludedProduct" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "variantIds" TEXT[],
    "rewardId" INTEGER NOT NULL,

    CONSTRAINT "ExcludedProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExcludedProduct" ADD CONSTRAINT "ExcludedProduct_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
