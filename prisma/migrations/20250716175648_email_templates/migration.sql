/*
  Warnings:

  - You are about to drop the column `productDisplay` on the `ReviewRequestEmailSettings` table. All the data in the column will be lost.
  - You are about to drop the column `productIds` on the `ReviewRequestEmailSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerQuestionEmailSettingsId]` on the table `ReviewRequestEmailLogo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerRewardEmailSettingsId]` on the table `ReviewRequestEmailLogo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailLogo" ADD COLUMN     "customerQuestionEmailSettingsId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerRewardEmailSettingsId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" DROP COLUMN "productDisplay",
DROP COLUMN "productIds";

-- CreateTable
CREATE TABLE "CustomerQuestionEmailSettings" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "bannerBgColor" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "CustomerQuestionEmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerRewardEmailSettings" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "bannerBgColor" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "CustomerRewardEmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_key" ON "ReviewRequestEmailLogo"("customerQuestionEmailSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequestEmailLogo_customerRewardEmailSettingsId_key" ON "ReviewRequestEmailLogo"("customerRewardEmailSettingsId");

-- AddForeignKey
ALTER TABLE "ReviewRequestEmailLogo" ADD CONSTRAINT "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_fkey" FOREIGN KEY ("customerQuestionEmailSettingsId") REFERENCES "CustomerQuestionEmailSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequestEmailLogo" ADD CONSTRAINT "ReviewRequestEmailLogo_customerRewardEmailSettingsId_fkey" FOREIGN KEY ("customerRewardEmailSettingsId") REFERENCES "CustomerRewardEmailSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
