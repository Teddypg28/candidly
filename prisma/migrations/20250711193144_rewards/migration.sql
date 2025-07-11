/*
  Warnings:

  - You are about to drop the column `withMedia` on the `Rewards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Rewards" DROP COLUMN "withMedia",
ADD COLUMN     "advanced" INTEGER NOT NULL DEFAULT 0;
