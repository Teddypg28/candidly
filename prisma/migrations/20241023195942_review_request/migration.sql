/*
  Warnings:

  - You are about to alter the column `orderId` on the `ReviewRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `productId` on the `ReviewRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `variantIds` column on the `ReviewRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" ALTER COLUMN "orderId" SET DATA TYPE INTEGER,
ALTER COLUMN "productId" SET DATA TYPE INTEGER,
DROP COLUMN "variantIds",
ADD COLUMN     "variantIds" INTEGER[];
