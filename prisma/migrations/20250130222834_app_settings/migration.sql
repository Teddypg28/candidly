/*
  Warnings:

  - Added the required column `companyName` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryEmail` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "primaryEmail" TEXT NOT NULL;
