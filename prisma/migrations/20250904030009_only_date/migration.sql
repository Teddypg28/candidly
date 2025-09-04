-- AlterTable
ALTER TABLE "ReviewRequest" ALTER COLUMN "nextRequestDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "renewalDate" SET DATA TYPE DATE,
ALTER COLUMN "planStarted" SET DATA TYPE DATE;
