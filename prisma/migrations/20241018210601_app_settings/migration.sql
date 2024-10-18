-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "autoPublish" BOOLEAN NOT NULL,
    "minRating" INTEGER NOT NULL,
    "requiresVerification" BOOLEAN NOT NULL
);
