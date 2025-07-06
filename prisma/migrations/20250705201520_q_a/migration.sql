-- CreateTable
CREATE TABLE "CustomerQuestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "store" TEXT NOT NULL,

    CONSTRAINT "CustomerQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerQuestionAnswer" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "CustomerQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerQuestionAnswer" ADD CONSTRAINT "CustomerQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CustomerQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
