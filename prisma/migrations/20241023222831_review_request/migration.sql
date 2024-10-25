/*
  Warnings:

  - You are about to drop the column `lineItemIds` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "lineItemIds",
DROP COLUMN "productId";
