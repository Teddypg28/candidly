/*
  Warnings:

  - You are about to drop the column `allowMultipleAnswers` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `answerLabel` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `displayAnswer` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ReviewFormQuestion` table. All the data in the column will be lost.
  - You are about to drop the `ReviewFormAnswerChoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewFormPresetInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answerType` to the `ReviewFormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReviewFormAnswerChoice" DROP CONSTRAINT "ReviewFormAnswerChoice_questionId_fkey";

-- AlterTable
ALTER TABLE "ReviewFormQuestion" DROP COLUMN "allowMultipleAnswers",
DROP COLUMN "answerLabel",
DROP COLUMN "displayAnswer",
DROP COLUMN "label",
DROP COLUMN "productId",
ADD COLUMN     "answerType" TEXT NOT NULL,
ADD COLUMN     "productIds" TEXT[];

-- DropTable
DROP TABLE "ReviewFormAnswerChoice";

-- DropTable
DROP TABLE "ReviewFormPresetInfo";

-- CreateTable
CREATE TABLE "RadioAnswerSettings" (
    "id" SERIAL NOT NULL,
    "answerChoices" TEXT[],
    "allowMultipleAnswers" BOOLEAN NOT NULL,
    "displayAnswer" BOOLEAN NOT NULL,
    "displayedAnswerLabel" TEXT,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "RadioAnswerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextAnswerSettings" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "TextAnswerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RadioAnswerSettings_questionId_key" ON "RadioAnswerSettings"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TextAnswerSettings_questionId_key" ON "TextAnswerSettings"("questionId");

-- AddForeignKey
ALTER TABLE "RadioAnswerSettings" ADD CONSTRAINT "RadioAnswerSettings_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextAnswerSettings" ADD CONSTRAINT "TextAnswerSettings_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
