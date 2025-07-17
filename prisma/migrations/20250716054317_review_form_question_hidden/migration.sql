/*
  Warnings:

  - Added the required column `hidden` to the `ReviewFormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewFormQuestion" ADD COLUMN     "hidden" BOOLEAN NOT NULL;
