/*
  Warnings:

  - You are about to drop the column `heading` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `headlinePlaceholder` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryFormColor` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewPlaceholder` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `subheading` on the `ReviewFormSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewFormSettings" DROP COLUMN "heading",
DROP COLUMN "headlinePlaceholder",
DROP COLUMN "primaryFormColor",
DROP COLUMN "reviewPlaceholder",
DROP COLUMN "subheading",
ADD COLUMN     "bodyHeading" TEXT NOT NULL DEFAULT 'What did your like or not like?',
ADD COLUMN     "bodyPlaceholder" TEXT NOT NULL DEFAULT 'What would you tell your friends?',
ADD COLUMN     "customQuestionsHeading" TEXT NOT NULL DEFAULT 'We are interested to know...',
ADD COLUMN     "mediaHeading" TEXT NOT NULL DEFAULT 'Want to add an image or video?',
ADD COLUMN     "starRatingHeading" TEXT NOT NULL DEFAULT 'How many stars would you give it?',
ADD COLUMN     "titleHeading" TEXT NOT NULL DEFAULT 'Give your review a title',
ADD COLUMN     "titlePlaceholder" TEXT NOT NULL DEFAULT 'Sum up your review in a few words';
