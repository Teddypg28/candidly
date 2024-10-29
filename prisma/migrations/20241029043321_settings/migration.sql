/*
  Warnings:

  - You are about to drop the column `formHeading` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - You are about to drop the column `formSubheading` on the `ReviewFormSettings` table. All the data in the column will be lost.
  - Added the required column `heading` to the `ReviewFormSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headlinePlaceholder` to the `ReviewFormSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewPlaceholder` to the `ReviewFormSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subheading` to the `ReviewFormSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewFormSettings" DROP COLUMN "formHeading",
DROP COLUMN "formSubheading",
ADD COLUMN     "heading" TEXT NOT NULL,
ADD COLUMN     "headlinePlaceholder" TEXT NOT NULL,
ADD COLUMN     "reviewPlaceholder" TEXT NOT NULL,
ADD COLUMN     "subheading" TEXT NOT NULL;
