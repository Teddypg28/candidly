-- AlterTable
ALTER TABLE "RewardSetting" ADD COLUMN     "bogoPurchaseProductId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bogoReceiveProductId" TEXT NOT NULL DEFAULT '';
