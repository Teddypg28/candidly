-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectRewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparRewardId_fkey";

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparRewardId_fkey" FOREIGN KEY ("subparRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodRewardId_fkey" FOREIGN KEY ("goodRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectRewardId_fkey" FOREIGN KEY ("perfectRewardId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
