/*
  Warnings:

  - The primary key for the `ReviewRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "ReviewRequest_orderId_key";

-- AlterTable
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id");
