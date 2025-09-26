/*
  Warnings:

  - You are about to drop the column `timezone` on the `ProductReview` table. All the data in the column will be lost.
  - You are about to drop the `TextAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TextAnswer" DROP CONSTRAINT "TextAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TextAnswer" DROP CONSTRAINT "TextAnswer_reviewId_fkey";

-- AlterTable
ALTER TABLE "ProductReview" DROP COLUMN "timezone";

-- DropTable
DROP TABLE "TextAnswer";
