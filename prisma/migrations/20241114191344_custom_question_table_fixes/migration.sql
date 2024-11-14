/*
  Warnings:

  - The `sortSelected` column on the `SavedCustomQuestionsTableView` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selectedProducts` column on the `SavedCustomQuestionsTableView` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selectedQuestionTypes` column on the `SavedCustomQuestionsTableView` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SavedCustomQuestionsTableView" DROP COLUMN "sortSelected",
ADD COLUMN     "sortSelected" TEXT[],
DROP COLUMN "selectedProducts",
ADD COLUMN     "selectedProducts" TEXT[],
DROP COLUMN "selectedQuestionTypes",
ADD COLUMN     "selectedQuestionTypes" TEXT[];
