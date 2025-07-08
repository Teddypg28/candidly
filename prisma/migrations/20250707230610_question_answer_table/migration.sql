/*
  Warnings:

  - You are about to drop the column `selectedAnswerStatusFilter` on the `SavedQuestionAnswerTableView` table. All the data in the column will be lost.
  - You are about to drop the column `selectedProductFilters` on the `SavedQuestionAnswerTableView` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SavedQuestionAnswerTableView" DROP COLUMN "selectedAnswerStatusFilter",
DROP COLUMN "selectedProductFilters",
ADD COLUMN     "selectedAnswerStatus" TEXT[],
ADD COLUMN     "selectedProducts" TEXT[];
