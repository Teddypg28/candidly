/*
  Warnings:

  - You are about to drop the column `cnameOne` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cnameThree` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `cnameTwo` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `AppSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "cnameOne",
DROP COLUMN "cnameThree",
DROP COLUMN "cnameTwo",
DROP COLUMN "isVerified";
