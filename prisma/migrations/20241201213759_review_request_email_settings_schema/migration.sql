/*
  Warnings:

  - You are about to drop the column `reviewRequestEmailProductDisplay` on the `AppSettings` table. All the data in the column will be lost.
  - You are about to drop the column `appSettingsId` on the `DisplayProduct` table. All the data in the column will be lost.
  - Added the required column `reviewRequestEmailSettingsId` to the `DisplayProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DisplayProduct" DROP CONSTRAINT "DisplayProduct_appSettingsId_fkey";

-- AlterTable
ALTER TABLE "AppSettings" DROP COLUMN "reviewRequestEmailProductDisplay";

-- AlterTable
ALTER TABLE "DisplayProduct" DROP COLUMN "appSettingsId",
ADD COLUMN     "reviewRequestEmailSettingsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ReviewRequestEmailSettings" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "productDisplay" TEXT[],

    CONSTRAINT "ReviewRequestEmailSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisplayProduct" ADD CONSTRAINT "DisplayProduct_reviewRequestEmailSettingsId_fkey" FOREIGN KEY ("reviewRequestEmailSettingsId") REFERENCES "ReviewRequestEmailSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
