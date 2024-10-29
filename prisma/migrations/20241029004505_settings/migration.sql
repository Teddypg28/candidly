/*
  Warnings:

  - You are about to drop the `ReviewFormSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `backgroundColor` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formHeading` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formSubheading` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryColor` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "backgroundColor" TEXT NOT NULL,
ADD COLUMN     "formHeading" TEXT NOT NULL,
ADD COLUMN     "formSubheading" TEXT NOT NULL,
ADD COLUMN     "primaryColor" TEXT NOT NULL;

-- DropTable
DROP TABLE "ReviewFormSettings";
