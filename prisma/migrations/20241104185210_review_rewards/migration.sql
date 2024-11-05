/*
  Warnings:

  - You are about to drop the column `store` on the `RewardSettings` table. All the data in the column will be lost.
  - Added the required column `store` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "productIds" BIGINT[],
ADD COLUMN     "store" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RewardSettings" DROP COLUMN "store";
