-- CreateTable
CREATE TABLE "ProductReviewImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,
    CONSTRAINT "ProductReviewImage_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
