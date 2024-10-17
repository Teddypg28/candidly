/*
  Warnings:

  - You are about to drop the column `isMandatory` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - Added the required column `isRequired` to the `ReviewFormQuestion` table without a default value. This is not possible if the table is not empty.

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
    "isRequired" BOOLEAN NOT NULL
);
INSERT INTO "new_ReviewFormQuestion" ("allowMultipleAnswers", "answerLabel", "displayAnswer", "id", "label", "productId", "store", "title") SELECT "allowMultipleAnswers", "answerLabel", "displayAnswer", "id", "label", "productId", "store", "title" FROM "ReviewFormQuestion";
DROP TABLE "ReviewFormQuestion";
ALTER TABLE "new_ReviewFormQuestion" RENAME TO "ReviewFormQuestion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
