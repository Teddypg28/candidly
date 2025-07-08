/*
  Warnings:

  - A unique constraint covering the columns `[questionId]` on the table `CustomerQuestionAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomerQuestionAnswer_questionId_key" ON "CustomerQuestionAnswer"("questionId");
