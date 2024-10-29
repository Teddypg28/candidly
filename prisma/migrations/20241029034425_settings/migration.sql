/*
  Warnings:

  - You are about to drop the `ReviewWidgetSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ReviewWidgetSettings";

-- CreateTable
CREATE TABLE "ReviewFormSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "formHeading" TEXT NOT NULL,
    "formSubheading" TEXT NOT NULL,
    "primaryFormColor" TEXT NOT NULL,
    "formBackgroundColor" TEXT NOT NULL,

    CONSTRAINT "ReviewFormSettings_pkey" PRIMARY KEY ("id")
);
