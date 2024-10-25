/*
  Warnings:

  - You are about to drop the `StoreAge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StoreAge";

-- CreateTable
CREATE TABLE "CurrentOrders" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "handled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CurrentOrders_pkey" PRIMARY KEY ("id")
);
