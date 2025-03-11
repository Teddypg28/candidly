/*
  Warnings:

  - The `isRequired` column on the `ReviewFormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `radioAllowMultipleAnswers` column on the `ReviewFormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `radioDisplayAnswer` column on the `ReviewFormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ReviewFormQuestion" ADD COLUMN     "productConfiguration" TEXT[],
DROP COLUMN "isRequired",
ADD COLUMN     "isRequired" TEXT[],
DROP COLUMN "radioAllowMultipleAnswers",
ADD COLUMN     "radioAllowMultipleAnswers" TEXT[],
DROP COLUMN "radioDisplayAnswer",
ADD COLUMN     "radioDisplayAnswer" TEXT[];
