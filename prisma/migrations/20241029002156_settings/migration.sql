/*
  Warnings:

  - You are about to drop the `ReviewSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ReviewSettings";

-- CreateTable
CREATE TABLE "ReviewFormSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "formHeading" TEXT NOT NULL,
    "formSubheading" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,

    CONSTRAINT "ReviewFormSettings_pkey" PRIMARY KEY ("id")
);
