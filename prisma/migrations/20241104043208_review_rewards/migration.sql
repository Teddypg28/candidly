/*
  Warnings:

  - You are about to drop the `MinPurchaseRequirements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MinPurchaseRequirements" DROP CONSTRAINT "MinPurchaseRequirements_rewardSettingsId_fkey";

-- AlterTable
ALTER TABLE "RewardSettings" ADD COLUMN     "minPurchaseDollarValue" TEXT,
ADD COLUMN     "minPurchaseQuantityValue" TEXT,
ADD COLUMN     "minPurchaseType" TEXT,
ALTER COLUMN "fixedAmount" DROP NOT NULL,
ALTER COLUMN "percentageAmount" DROP NOT NULL,
ALTER COLUMN "bogoRewardType" DROP NOT NULL,
ALTER COLUMN "bogoPurchaseAmount" DROP NOT NULL,
ALTER COLUMN "bogoReceiveAmount" DROP NOT NULL,
ALTER COLUMN "bogoDiscountAmount" DROP NOT NULL;

-- DropTable
DROP TABLE "MinPurchaseRequirements";
