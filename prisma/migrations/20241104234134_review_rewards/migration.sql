/*
  Warnings:

  - You are about to drop the `RewardSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `goodId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfectId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subparId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RewardSettings" DROP CONSTRAINT "RewardSettings_goodId_fkey";

-- DropForeignKey
ALTER TABLE "RewardSettings" DROP CONSTRAINT "RewardSettings_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "RewardSettings" DROP CONSTRAINT "RewardSettings_subparId_fkey";

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "goodId" INTEGER NOT NULL,
ADD COLUMN     "perfectId" INTEGER NOT NULL,
ADD COLUMN     "subparId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "RewardSettings";

-- CreateTable
CREATE TABLE "RewardSetting" (
    "id" SERIAL NOT NULL,
    "selectedRewardType" TEXT NOT NULL DEFAULT 'percent',
    "fixedAmount" INTEGER DEFAULT 10,
    "percentageAmount" INTEGER DEFAULT 10,
    "bogoRewardType" TEXT DEFAULT 'free',
    "bogoPurchaseAmount" INTEGER DEFAULT 1,
    "bogoReceiveAmount" INTEGER DEFAULT 1,
    "bogoDiscountAmount" INTEGER DEFAULT 1,
    "minPurchaseType" TEXT,
    "minPurchaseDollarValue" TEXT,
    "minPurchaseQuantityValue" TEXT,

    CONSTRAINT "RewardSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
