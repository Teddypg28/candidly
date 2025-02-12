/*
  Warnings:

  - You are about to drop the column `name` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestSentDate` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "name",
DROP COLUMN "requestSentDate",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "nextRequestDate" TIMESTAMP(3);
