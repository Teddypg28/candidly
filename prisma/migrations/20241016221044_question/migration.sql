/*
  Warnings:

  - Made the column `allowMultipleAnswers` on table `ReviewFormQuestion` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReviewFormQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "answerLabel" TEXT,
    "displayAnswer" BOOLEAN NOT NULL,
    "allowMultipleAnswers" BOOLEAN NOT NULL,
    "isMandatory" BOOLEAN NOT NULL
);
INSERT INTO "new_ReviewFormQuestion" ("allowMultipleAnswers", "answerLabel", "displayAnswer", "id", "isMandatory", "label", "productId", "store", "title") SELECT "allowMultipleAnswers", "answerLabel", "displayAnswer", "id", "isMandatory", "label", "productId", "store", "title" FROM "ReviewFormQuestion";
DROP TABLE "ReviewFormQuestion";
ALTER TABLE "new_ReviewFormQuestion" RENAME TO "ReviewFormQuestion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
