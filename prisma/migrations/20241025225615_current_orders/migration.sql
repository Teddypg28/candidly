/*
  Warnings:

  - You are about to drop the `CurrentOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CurrentOrders";

-- CreateTable
CREATE TABLE "CurrentOrdersStatus" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "handled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CurrentOrdersStatus_pkey" PRIMARY KEY ("id")
);
