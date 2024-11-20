/*
  Warnings:

  - You are about to drop the `radioAnswerChoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "radioAnswerChoice" DROP CONSTRAINT "radioAnswerChoice_questionId_fkey";

-- DropForeignKey
ALTER TABLE "radioAnswerChoice" DROP CONSTRAINT "radioAnswerChoice_reviewId_fkey";

-- DropTable
DROP TABLE "radioAnswerChoice";

-- CreateTable
CREATE TABLE "RadioAnswerChoice" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "display" BOOLEAN NOT NULL,
    "questionId" INTEGER NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "RadioAnswerChoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RadioAnswerChoice" ADD CONSTRAINT "RadioAnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioAnswerChoice" ADD CONSTRAINT "RadioAnswerChoice_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
