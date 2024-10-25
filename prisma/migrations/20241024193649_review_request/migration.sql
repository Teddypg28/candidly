/*
  Warnings:

  - Added the required column `orderFulfilled` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" ADD COLUMN     "orderFulfilled" BOOLEAN NOT NULL,
ALTER COLUMN "requestDate" DROP NOT NULL;
