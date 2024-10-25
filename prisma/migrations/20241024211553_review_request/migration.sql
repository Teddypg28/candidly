/*
  Warnings:

  - You are about to drop the column `requestNumber` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `email` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "requestNumber",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "emailsSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "reviewStatus" TEXT NOT NULL DEFAULT 'Waiting';
