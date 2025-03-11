-- CreateTable
CREATE TABLE "StoreAge" (
    "id" SERIAL NOT NULL,
    "store" INTEGER NOT NULL,
    "firstVisit" BOOLEAN NOT NULL,

    CONSTRAINT "StoreAge_pkey" PRIMARY KEY ("id")
);
