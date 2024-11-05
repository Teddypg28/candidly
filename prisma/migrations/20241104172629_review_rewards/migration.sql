-- DropForeignKey
ALTER TABLE "RewardSettings" DROP CONSTRAINT "RewardSettings_rewardId_fkey";

-- AddForeignKey
ALTER TABLE "RewardSettings" ADD CONSTRAINT "RewardSettings_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "ReviewReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
