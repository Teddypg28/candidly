/*
  Warnings:

  - The `renewalDate` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `subscriptionId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailQuota` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "renewalDate",
ADD COLUMN     "renewalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "subscriptionId" SET NOT NULL,
ALTER COLUMN "subscriptionId" SET DEFAULT '',
ALTER COLUMN "emailQuota" SET NOT NULL;
