/*
  Warnings:

  - A unique constraint covering the columns `[customerQuestionEmailSettingsId]` on the table `ReviewRequestEmailLogo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerRewardEmailSettingsId]` on the table `ReviewRequestEmailLogo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerQuestionEmailSettingsId` to the `ReviewRequestEmailLogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerRewardEmailSettingsId` to the `ReviewRequestEmailLogo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewRequestEmailLogo" ADD COLUMN     "customerQuestionEmailSettingsId" TEXT NOT NULL,
ADD COLUMN     "customerRewardEmailSettingsId" TEXT NOT NULL;

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
