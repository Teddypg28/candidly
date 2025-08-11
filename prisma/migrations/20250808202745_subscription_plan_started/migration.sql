-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "planStarted" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "renewalDate" DROP DEFAULT;
