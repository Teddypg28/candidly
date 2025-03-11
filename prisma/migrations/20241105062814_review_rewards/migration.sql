-- DropForeignKey
ALTER TABLE "RewardSetting" DROP CONSTRAINT "RewardSetting_rewardId_fkey";

-- AddForeignKey
ALTER TABLE "RewardSetting" ADD CONSTRAINT "RewardSetting_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
