/*
  Warnings:

  - You are about to drop the column `products` on the `ReviewRequestEmailSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" DROP COLUMN "products",
ADD COLUMN     "productIds" TEXT[];
