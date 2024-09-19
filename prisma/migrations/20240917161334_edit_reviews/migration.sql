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
    "date" DATETIME NOT NULL
);
INSERT INTO "new_ProductReview" ("body", "date", "email", "id", "name", "productId", "rating", "store", "title") SELECT "body", "date", "email", "id", "name", "productId", "rating", "store", "title" FROM "ProductReview";
DROP TABLE "ProductReview";
ALTER TABLE "new_ProductReview" RENAME TO "ProductReview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
