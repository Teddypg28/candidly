/*
  Warnings:

  - Added the required column `email` to the `CustomerQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `CustomerQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerQuestion" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL;
