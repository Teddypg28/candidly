-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "isReviewFormDisabled" TEXT NOT NULL DEFAULT 'false';

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "emailQuota" DROP DEFAULT,
ALTER COLUMN "renewalDate" SET DEFAULT '';
