/*
  Warnings:

  - You are about to drop the column `formBackgroundColor` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `formHeading` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `formSubheading` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryFormColor` on the `AppSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "formBackgroundColor",
DROP COLUMN "formHeading",
DROP COLUMN "formSubheading",
DROP COLUMN "primaryFormColor";

-- CreateTable
CREATE TABLE "ReviewWidgetSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "formHeading" TEXT NOT NULL,
    "formSubheading" TEXT NOT NULL,
    "primaryFormColor" TEXT NOT NULL,
    "formBackgroundColor" TEXT NOT NULL,

    CONSTRAINT "ReviewWidgetSettings_pkey" PRIMARY KEY ("id")
);
