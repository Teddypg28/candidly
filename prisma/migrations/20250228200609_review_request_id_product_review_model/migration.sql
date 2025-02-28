/*
  Warnings:

  - Added the required column `reviewRequestId` to the `ProductReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductReview" ADD COLUMN     "reviewRequestId" TEXT NOT NULL;
