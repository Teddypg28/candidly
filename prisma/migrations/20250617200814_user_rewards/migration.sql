/*
  Warnings:

  - You are about to drop the `UserRewards` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `authToken` on table `ReviewRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" ALTER COLUMN "authToken" SET NOT NULL;

-- DropTable
DROP TABLE "UserRewards";
