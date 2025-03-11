/*
  Warnings:

  - Added the required column `firstEmail` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondEmail` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thirdEmail` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "firstEmail" INTEGER NOT NULL,
ADD COLUMN     "secondEmail" INTEGER NOT NULL,
ADD COLUMN     "thirdEmail" INTEGER NOT NULL;
