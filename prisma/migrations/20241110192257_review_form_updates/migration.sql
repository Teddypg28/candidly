/*
  Warnings:

  - Added the required column `store` to the `ReviewFormPresetInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewFormPresetInfo" ADD COLUMN     "store" TEXT NOT NULL;
