/*
  Warnings:

  - Added the required column `productId` to the `CustomerQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerQuestion" ADD COLUMN     "productId" TEXT NOT NULL;
