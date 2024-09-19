/*
  Warnings:

  - You are about to drop the `ProductReviewImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductReviewImage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProductReviewMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,
    CONSTRAINT "ProductReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
