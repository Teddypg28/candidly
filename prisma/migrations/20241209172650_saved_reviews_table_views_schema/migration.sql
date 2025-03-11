/*
  Warnings:

  - Added the required column `pageNumber` to the `SavedReviewsTableViews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedReviewsTableViews" ADD COLUMN     "pageNumber" INTEGER NOT NULL;
