/*
  Warnings:

  - You are about to drop the `savedCustomQuestionsTableView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "savedCustomQuestionsTableView";

-- CreateTable
CREATE TABLE "SavedCustomQuestionsTableView" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT NOT NULL,
    "selectedProducts" TEXT,
    "selectedQuestionTypes" TEXT,

    CONSTRAINT "SavedCustomQuestionsTableView_pkey" PRIMARY KEY ("id")
);
