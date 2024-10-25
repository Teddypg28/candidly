/*
  Warnings:

  - You are about to drop the column `orderFulfilled` on the `ReviewRequest` table. All the data in the column will be lost.
  - Added the required column `fulfillmentStatus` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "orderFulfilled",
ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL;
