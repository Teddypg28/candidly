/*
  Warnings:

  - You are about to drop the column `variantIds` on the `ReviewRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "variantIds",
ADD COLUMN     "lineItemIds" BIGINT[];
