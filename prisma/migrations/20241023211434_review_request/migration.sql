/*
  Warnings:

  - You are about to drop the column `email` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "email",
DROP COLUMN "name";
