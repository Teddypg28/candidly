/*
  Warnings:

  - You are about to drop the column `timezone` on the `ProductReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductReview" DROP COLUMN "timezone";

-- AlterTable
ALTER TABLE "ReviewRequest" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Chicago';
