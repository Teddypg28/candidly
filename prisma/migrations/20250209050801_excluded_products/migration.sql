-- DropForeignKey
ALTER TABLE "ExcludedProduct" DROP CONSTRAINT "ExcludedProduct_rewardId_fkey";

-- AddForeignKey
ALTER TABLE "ExcludedProduct" ADD CONSTRAINT "ExcludedProduct_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
