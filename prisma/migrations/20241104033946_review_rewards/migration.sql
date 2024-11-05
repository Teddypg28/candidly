-- CreateTable
CREATE TABLE "RewardSettings" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "selectedRewardType" TEXT NOT NULL DEFAULT 'percent',
    "fixedAmount" INTEGER NOT NULL DEFAULT 10,
    "percentageAmount" INTEGER NOT NULL DEFAULT 10,
    "bogoRewardType" TEXT NOT NULL DEFAULT 'free',
    "bogoPurchaseAmount" INTEGER NOT NULL DEFAULT 1,
    "bogoReceiveAmount" INTEGER NOT NULL DEFAULT 1,
    "bogoDiscountAmount" INTEGER NOT NULL DEFAULT 1,
    "rewardId" INTEGER NOT NULL,

    CONSTRAINT "RewardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinPurchaseRequirements" (
    "id" SERIAL NOT NULL,
    "rewardSettingsId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "dollarValue" TEXT NOT NULL,
    "quantityValue" TEXT NOT NULL,

    CONSTRAINT "MinPurchaseRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReward" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ReviewReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MinPurchaseRequirements_rewardSettingsId_key" ON "MinPurchaseRequirements"("rewardSettingsId");

-- AddForeignKey
ALTER TABLE "RewardSettings" ADD CONSTRAINT "RewardSettings_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "ReviewReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinPurchaseRequirements" ADD CONSTRAINT "MinPurchaseRequirements_rewardSettingsId_fkey" FOREIGN KEY ("rewardSettingsId") REFERENCES "RewardSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
