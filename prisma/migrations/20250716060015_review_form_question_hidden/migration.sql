/*
  Warnings:

  - You are about to drop the column `hidden` on the `ReviewFormQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewFormQuestion" DROP COLUMN "hidden",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;
