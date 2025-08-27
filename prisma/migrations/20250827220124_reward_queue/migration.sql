-- AlterTable
ALTER TABLE "ProductReview" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PendingReward" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,

    CONSTRAINT "PendingReward_pkey" PRIMARY KEY ("id")
);
