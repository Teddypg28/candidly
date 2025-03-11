/*
  Warnings:

  - The `sortSelected` column on the `SavedReviewsTableViews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selectedProducts` column on the `SavedReviewsTableViews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selectedRatings` column on the `SavedReviewsTableViews` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SavedReviewsTableViews" DROP COLUMN "sortSelected",
ADD COLUMN     "sortSelected" TEXT[],
DROP COLUMN "selectedProducts",
ADD COLUMN     "selectedProducts" TEXT[],
DROP COLUMN "selectedRatings",
ADD COLUMN     "selectedRatings" TEXT[];
