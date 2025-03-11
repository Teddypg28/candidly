-- DropForeignKey
ALTER TABLE "EligibleProduct" DROP CONSTRAINT "EligibleProduct_rewardId_fkey";

-- AddForeignKey
ALTER TABLE "EligibleProduct" ADD CONSTRAINT "EligibleProduct_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
