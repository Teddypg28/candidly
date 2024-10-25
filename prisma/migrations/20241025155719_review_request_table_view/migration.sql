/*
  Warnings:

  - Added the required column `queryValue` to the `SavedReviewRequestTableView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedTab` to the `SavedReviewRequestTableView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedReviewRequestTableView" ADD COLUMN     "queryValue" TEXT NOT NULL,
ADD COLUMN     "selectedFulfillmentFilters" TEXT[],
ADD COLUMN     "selectedProductFilters" TEXT[],
ADD COLUMN     "selectedTab" INTEGER NOT NULL,
ADD COLUMN     "sortSelected" TEXT[];
