/*
  Warnings:

  - Added the required column `store` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "autoPublish" BOOLEAN NOT NULL,
    "minRating" INTEGER NOT NULL,
    "requiresVerification" BOOLEAN NOT NULL
);
INSERT INTO "new_AppSettings" ("autoPublish", "id", "minRating", "requiresVerification") SELECT "autoPublish", "id", "minRating", "requiresVerification" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
