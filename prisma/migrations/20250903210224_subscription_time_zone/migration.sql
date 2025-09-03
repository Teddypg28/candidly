-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "timezone" TEXT,
ALTER COLUMN "subscriptionId" DROP NOT NULL,
ALTER COLUMN "subscriptionId" DROP DEFAULT;
