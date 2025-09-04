/*
  Warnings:

  - The `nextRequestDate` column on the `ReviewRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "nextRequestDate",
ADD COLUMN     "nextRequestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
