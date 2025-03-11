/*
  Warnings:

  - You are about to drop the column `thirdEmail` on the `AppSettings` table. All the data in the column will be lost.
  - The `autoPublish` column on the `AppSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "thirdEmail",
DROP COLUMN "autoPublish",
ADD COLUMN     "autoPublish" BOOLEAN[];
