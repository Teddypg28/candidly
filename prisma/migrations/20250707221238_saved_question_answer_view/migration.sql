-- CreateTable
CREATE TABLE "SavedQuestionAnswerTableView" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT[],
    "selectedProductFilters" TEXT[],

    CONSTRAINT "SavedQuestionAnswerTableView_pkey" PRIMARY KEY ("id")
);
