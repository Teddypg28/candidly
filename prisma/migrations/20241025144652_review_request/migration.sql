/*
  Warnings:

  - Added the required column `orderNumber` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" ADD COLUMN     "orderNumber" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SavedReviewRequestTableView" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "SavedReviewRequestTableView_pkey" PRIMARY KEY ("id")
);
