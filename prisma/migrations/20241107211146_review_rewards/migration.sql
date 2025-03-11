/*
  Warnings:

  - Changed the type of `minPurchaseDollarValue` on the `RewardSetting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `minPurchaseQuantityValue` on the `RewardSetting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparRewardId_fkey";

-- AlterTable
ALTER TABLE "RewardSetting" DROP COLUMN "minPurchaseDollarValue",
ADD COLUMN     "minPurchaseDollarValue" INTEGER NOT NULL,
DROP COLUMN "minPurchaseQuantityValue",
ADD COLUMN     "minPurchaseQuantityValue" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparRewardId_fkey" FOREIGN KEY ("subparRewardId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodRewardId_fkey" FOREIGN KEY ("goodRewardId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectRewardId_fkey" FOREIGN KEY ("perfectRewardId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
