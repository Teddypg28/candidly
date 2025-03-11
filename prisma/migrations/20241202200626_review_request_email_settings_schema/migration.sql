/*
  Warnings:

  - You are about to drop the `DisplayProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisplayProduct" DROP CONSTRAINT "DisplayProduct_reviewRequestEmailSettingsId_fkey";

-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" ADD COLUMN     "products" BIGINT[];

-- DropTable
DROP TABLE "DisplayProduct";
