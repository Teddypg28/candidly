-- CreateTable
CREATE TABLE "RestockFormSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonColor" TEXT NOT NULL,
    "minimumInventoryForAlert" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "formHeading" TEXT NOT NULL,
    "formSubheading" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CustomQuestionAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "display" BOOLEAN NOT NULL,
    "reviewId" INTEGER NOT NULL,
    CONSTRAINT "CustomQuestionAnswer_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewFormQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "answerLabel" TEXT,
    "displayAnswer" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewFormAnswerChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "ReviewFormAnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedReviewsTableViews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT NOT NULL,
    "selectedProducts" TEXT,
    "selectedRatings" TEXT
);
