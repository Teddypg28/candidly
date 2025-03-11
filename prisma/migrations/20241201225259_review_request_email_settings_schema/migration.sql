/*
  Warnings:

  - Made the column `imageUrl` on table `DisplayProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DisplayProduct" ALTER COLUMN "imageUrl" SET NOT NULL;
