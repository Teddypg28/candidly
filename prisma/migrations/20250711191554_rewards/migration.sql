-- CreateTable
CREATE TABLE "Rewards" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "plain" INTEGER NOT NULL DEFAULT 0,
    "withMedia" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Rewards_pkey" PRIMARY KEY ("id")
);
