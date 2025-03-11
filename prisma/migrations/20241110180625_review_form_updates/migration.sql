/*
  Warnings:

  - You are about to drop the column `email` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `orderName` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "email",
DROP COLUMN "orderName";

-- CreateTable
CREATE TABLE "ReviewFormPresetInfo" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ReviewFormPresetInfo_pkey" PRIMARY KEY ("id")
);
