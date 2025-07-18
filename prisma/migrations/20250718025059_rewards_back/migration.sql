-- AlterTable
ALTER TABLE "EmailDesignSettings" ALTER COLUMN "bannerBgColor" SET DEFAULT '#FFFFFF';

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

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "subparId" TEXT NOT NULL,
    "goodId" TEXT NOT NULL,
    "perfectId" TEXT NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardSetting" (
    "id" TEXT NOT NULL,
    "selectedRewardType" TEXT NOT NULL,
    "fixedAmount" INTEGER NOT NULL,
    "percentageAmount" INTEGER NOT NULL,
    "bogoRewardType" TEXT NOT NULL,
    "bogoPurchaseAmount" INTEGER NOT NULL,
    "bogoReceiveAmount" INTEGER NOT NULL,
    "bogoDiscountAmount" INTEGER NOT NULL,
    "minPurchaseType" TEXT NOT NULL,
    "minPurchaseDollarValue" INTEGER NOT NULL,
    "minPurchaseQuantityValue" INTEGER NOT NULL,
    "productCollectionConfiguration" TEXT NOT NULL DEFAULT 'all',

    CONSTRAINT "RewardSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_subparId_key" ON "Reward"("subparId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_goodId_key" ON "Reward"("goodId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_perfectId_key" ON "Reward"("perfectId");

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibleCollection" ADD CONSTRAINT "EligibleCollection_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
