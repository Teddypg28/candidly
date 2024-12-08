/*
  Warnings:

  - You are about to drop the column `selectedVisiblity` on the `SavedReviewsTableViews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SavedReviewsTableViews" DROP COLUMN "selectedVisiblity",
ADD COLUMN     "selectedVisibility" TEXT[];
