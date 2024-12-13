-- DropForeignKey
ALTER TABLE "AnswerChoiceSnapshot" DROP CONSTRAINT "AnswerChoiceSnapshot_questionId_fkey";

-- CreateTable
CREATE TABLE "TextAnswer" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "TextAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextAnswer" ADD CONSTRAINT "TextAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
