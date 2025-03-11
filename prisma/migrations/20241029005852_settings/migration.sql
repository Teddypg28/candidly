/*
  Warnings:

  - You are about to drop the column `reviewRequestOneDays` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewRequestTwoDays` on the `AppSettings` table. All the data in the column will be lost.
  - Added the required column `firstReviewRequest` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondReviewRequest` to the `AppSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "reviewRequestOneDays",
DROP COLUMN "reviewRequestTwoDays",
ADD COLUMN     "firstReviewRequest" INTEGER NOT NULL,
ADD COLUMN     "secondReviewRequest" INTEGER NOT NULL;
