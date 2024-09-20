/*
  Warnings:

  - You are about to drop the `ProductReviewMedia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `media` to the `ProductReview` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductReviewMedia";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL,
    "media" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);
INSERT INTO "new_ProductReview" ("body", "date", "email", "id", "name", "productId", "rating", "store", "title") SELECT "body", "date", "email", "id", "name", "productId", "rating", "store", "title" FROM "ProductReview";
DROP TABLE "ProductReview";
ALTER TABLE "new_ProductReview" RENAME TO "ProductReview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
