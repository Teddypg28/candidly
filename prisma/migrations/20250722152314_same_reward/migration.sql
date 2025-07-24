/*
  Warnings:

  - You are about to drop the column `sameId` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `sameRewardValue` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_sameId_fkey";

-- DropIndex
DROP INDEX "Reward_sameId_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "sameId",
ADD COLUMN     "sameRewardValue" INTEGER NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;
