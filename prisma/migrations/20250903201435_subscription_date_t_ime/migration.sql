/*
  Warnings:

  - The `renewalDate` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `planStarted` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "renewalDate",
ADD COLUMN     "renewalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "planStarted",
ADD COLUMN     "planStarted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
