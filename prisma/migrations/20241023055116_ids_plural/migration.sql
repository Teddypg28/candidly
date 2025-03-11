/*
  Warnings:

  - You are about to drop the column `productId` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "productId",
DROP COLUMN "variantId",
ADD COLUMN     "productIds" BIGINT[],
ADD COLUMN     "variantIds" BIGINT[];
