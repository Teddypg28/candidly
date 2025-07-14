-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "cnameOne" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cnameThree" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cnameTwo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "domain" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "autoPublishReviews" SET DEFAULT ARRAY['false']::TEXT[],
ALTER COLUMN "minReviewRating" SET DEFAULT 5,
ALTER COLUMN "firstReviewRequest" SET DEFAULT 10,
ALTER COLUMN "secondReviewRequest" SET DEFAULT 5;
