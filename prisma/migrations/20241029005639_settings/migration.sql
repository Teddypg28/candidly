/*
  Warnings:

  - You are about to drop the column `autoPublish` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundColor` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `firstEmail` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `minRating` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `requiresVerification` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `secondEmail` on the `AppSettings` table. All the data in the column will be lost.
  - Added the required column `formBackgroundColor` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minReviewRating` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryFormColor` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewRequestOneDays` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewRequestTwoDays` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "autoPublish",
DROP COLUMN "backgroundColor",
DROP COLUMN "firstEmail",
DROP COLUMN "minRating",
DROP COLUMN "primaryColor",
DROP COLUMN "requiresVerification",
DROP COLUMN "secondEmail",
ADD COLUMN     "autoPublishReviews" TEXT[],
ADD COLUMN     "formBackgroundColor" TEXT NOT NULL,
ADD COLUMN     "minReviewRating" INTEGER NOT NULL,
ADD COLUMN     "primaryFormColor" TEXT NOT NULL,
ADD COLUMN     "reviewRequestOneDays" INTEGER NOT NULL,
ADD COLUMN     "reviewRequestTwoDays" INTEGER NOT NULL;
