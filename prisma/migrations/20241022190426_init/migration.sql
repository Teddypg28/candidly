-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockFormSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonColor" TEXT NOT NULL,
    "minimumInventoryForAlert" INTEGER NOT NULL,

    CONSTRAINT "RestockFormSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "formHeading" TEXT NOT NULL,
    "formSubheading" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,

    CONSTRAINT "ReviewSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "display" BOOLEAN NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "CustomQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL,
    "media" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFormQuestion" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "answerLabel" TEXT,
    "displayAnswer" BOOLEAN NOT NULL,
    "allowMultipleAnswers" BOOLEAN NOT NULL,
    "isRequired" BOOLEAN NOT NULL,

    CONSTRAINT "ReviewFormQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFormAnswerChoice" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ReviewFormAnswerChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReviewsTableViews" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT NOT NULL,
    "selectedProducts" TEXT,
    "selectedRatings" TEXT,

    CONSTRAINT "SavedReviewsTableViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savedCustomQuestionsTableView" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "sortSelected" TEXT NOT NULL,
    "selectedProducts" TEXT,
    "selectedQuestionTypes" TEXT,

    CONSTRAINT "savedCustomQuestionsTableView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "autoPublish" BOOLEAN NOT NULL,
    "minRating" INTEGER NOT NULL,
    "requiresVerification" BOOLEAN NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "orderID" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "productID" BIGINT[],
    "requestDate" TIMESTAMP(3) NOT NULL,
    "requestNumber" INTEGER NOT NULL,
    "daysAfterFirst" INTEGER NOT NULL,
    "daysAfterSecond" INTEGER NOT NULL,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomQuestionAnswer" ADD CONSTRAINT "CustomQuestionAnswer_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFormAnswerChoice" ADD CONSTRAINT "ReviewFormAnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
