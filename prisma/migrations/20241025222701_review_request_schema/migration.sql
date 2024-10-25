/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `orderName` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "orderNumber",
ADD COLUMN     "orderName" TEXT NOT NULL;
