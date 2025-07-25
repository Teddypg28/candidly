/*
  Warnings:

  - You are about to drop the column `bogoDiscountAmount` on the `RewardSetting` table. All the data in the column will be lost.
  - You are about to drop the column `fixedAmount` on the `RewardSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RewardSetting" DROP COLUMN "bogoDiscountAmount",
DROP COLUMN "fixedAmount",
ADD COLUMN     "bogoDollarAmount" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "bogoPercentageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
ADD COLUMN     "dollarAmount" INTEGER NOT NULL DEFAULT 10;
