/*
  Warnings:

  - You are about to drop the `_ProductReviewToRadioAnswerChoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductReviewToRadioAnswerChoice" DROP CONSTRAINT "_ProductReviewToRadioAnswerChoice_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductReviewToRadioAnswerChoice" DROP CONSTRAINT "_ProductReviewToRadioAnswerChoice_B_fkey";

-- DropTable
DROP TABLE "_ProductReviewToRadioAnswerChoice";

-- CreateTable
CREATE TABLE "AnswerChoiceSnapshot" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "display" BOOLEAN NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerChoiceSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
