/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `ReviewRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequest_orderId_key" ON "ReviewRequest"("orderId");
