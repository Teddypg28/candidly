/*
  Warnings:

  - Added the required column `bannerBgColor` to the `ReviewRequestEmailSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" ADD COLUMN     "bannerBgColor" TEXT NOT NULL;
