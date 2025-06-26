/*
  Warnings:

  - You are about to drop the `ExcludedProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExcludedProduct" DROP CONSTRAINT "ExcludedProduct_rewardSettingId_fkey";

-- DropTable
DROP TABLE "ExcludedProduct";

-- CreateTable
CREATE TABLE "EligibleProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rewardSettingId" TEXT NOT NULL,

    CONSTRAINT "EligibleProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibleCollection" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "rewardSettingId" TEXT NOT NULL,

    CONSTRAINT "EligibleCollection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibleCollection" ADD CONSTRAINT "EligibleCollection_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
