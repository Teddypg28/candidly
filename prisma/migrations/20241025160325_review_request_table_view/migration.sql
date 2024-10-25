/*
  Warnings:

  - Added the required column `store` to the `SavedReviewRequestTableView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedReviewRequestTableView" ADD COLUMN     "store" TEXT NOT NULL;
