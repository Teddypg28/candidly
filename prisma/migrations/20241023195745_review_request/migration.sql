/*
  Warnings:

  - You are about to drop the column `lineItemId` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `email` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantIds` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "lineItemId",
DROP COLUMN "variantId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "variantIds" BIGINT NOT NULL;
