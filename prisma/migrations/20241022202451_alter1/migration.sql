/*
  Warnings:

  - You are about to drop the column `daysAfterFirst` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `daysAfterSecond` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `orderID` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `productID` on the `ReviewRequest` table. All the data in the column will be lost.
  - You are about to drop the `RestockFormSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `daysToWaitFirst` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daysToWaitSecond` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequest" DROP COLUMN "daysAfterFirst",
DROP COLUMN "daysAfterSecond",
DROP COLUMN "orderID",
DROP COLUMN "productID",
ADD COLUMN     "daysToWaitFirst" INTEGER NOT NULL,
ADD COLUMN     "daysToWaitSecond" INTEGER NOT NULL,
ADD COLUMN     "orderId" BIGINT NOT NULL,
ADD COLUMN     "productId" BIGINT[];

-- DropTable
DROP TABLE "RestockFormSettings";
