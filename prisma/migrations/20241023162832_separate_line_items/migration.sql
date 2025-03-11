/*
  Warnings:

  - You are about to drop the column `lineItemIds` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `productIds` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `variantIds` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `lineItemId` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "lineItemIds",
DROP COLUMN "productIds",
DROP COLUMN "variantIds",
ADD COLUMN     "lineItemId" BIGINT NOT NULL,
ADD COLUMN     "productId" BIGINT NOT NULL,
ADD COLUMN     "variantId" BIGINT NOT NULL;
