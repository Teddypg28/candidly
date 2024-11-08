-- AlterTable
ALTER TABLE "RewardSetting" ALTER COLUMN "selectedRewardType" DROP DEFAULT,
ALTER COLUMN "fixedAmount" DROP DEFAULT,
ALTER COLUMN "percentageAmount" DROP DEFAULT,
ALTER COLUMN "bogoRewardType" DROP DEFAULT,
ALTER COLUMN "bogoPurchaseAmount" DROP DEFAULT,
ALTER COLUMN "bogoReceiveAmount" DROP DEFAULT,
ALTER COLUMN "bogoDiscountAmount" DROP DEFAULT;
