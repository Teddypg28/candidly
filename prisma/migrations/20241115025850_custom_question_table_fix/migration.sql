/*
  Warnings:

  - You are about to drop the `SavedCustomQuestionsTableView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SavedCustomQuestionsTableView";

-- CreateTable
CREATE TABLE "SavedCustomQuestionTableView" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT[],
    "selectedProductConfiguration" TEXT[],

    CONSTRAINT "SavedCustomQuestionTableView_pkey" PRIMARY KEY ("id")
);
