/*
  Warnings:

  - The primary key for the `ReviewRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("orderId");
