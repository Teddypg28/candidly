-- CreateTable
CREATE TABLE "savedCustomQuestionsTableView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT NOT NULL,
    "selectedProducts" TEXT,
    "selectedQuestionTypes" TEXT
);
