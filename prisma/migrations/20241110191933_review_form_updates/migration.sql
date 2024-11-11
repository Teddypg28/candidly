/*
  Warnings:

  - Added the required column `VariantTitle` to the `ReviewFormPresetInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewFormPresetInfo" ADD COLUMN     "VariantTitle" TEXT NOT NULL;
