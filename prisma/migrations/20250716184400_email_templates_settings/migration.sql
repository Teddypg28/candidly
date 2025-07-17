/*
  Warnings:

  - You are about to drop the column `bannerBgColor` on the `CustomerQuestionEmailSettings` table. All the data in the column will be lost.
  - You are about to drop the column `bannerBgColor` on the `CustomerRewardEmailSettings` table. All the data in the column will be lost.
  - You are about to drop the column `customerQuestionEmailSettingsId` on the `ReviewRequestEmailLogo` table. All the data in the column will be lost.
  - You are about to drop the column `customerRewardEmailSettingsId` on the `ReviewRequestEmailLogo` table. All the data in the column will be lost.
  - You are about to drop the column `reviewRequestEmailSettingsId` on the `ReviewRequestEmailLogo` table. All the data in the column will be lost.
  - You are about to drop the column `bannerBgColor` on the `ReviewRequestEmailSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailDesignSettingsId]` on the table `ReviewRequestEmailLogo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailDesignSettingsId` to the `ReviewRequestEmailLogo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_customerRewardEmailSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_fkey";

-- DropIndex
DROP INDEX "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_key";

-- DropIndex
DROP INDEX "ReviewRequestEmailLogo_customerRewardEmailSettingsId_key";

-- DropIndex
DROP INDEX "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_key";

-- AlterTable
ALTER TABLE "CustomerQuestionEmailSettings" DROP COLUMN "bannerBgColor";

-- AlterTable
ALTER TABLE "CustomerRewardEmailSettings" DROP COLUMN "bannerBgColor";

-- AlterTable
ALTER TABLE "ReviewRequestEmailLogo" DROP COLUMN "customerQuestionEmailSettingsId",
DROP COLUMN "customerRewardEmailSettingsId",
DROP COLUMN "reviewRequestEmailSettingsId",
ADD COLUMN     "emailDesignSettingsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" DROP COLUMN "bannerBgColor";

-- CreateTable
CREATE TABLE "EmailDesignSettings" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "bannerBgColor" TEXT NOT NULL,

    CONSTRAINT "EmailDesignSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequestEmailLogo_emailDesignSettingsId_key" ON "ReviewRequestEmailLogo"("emailDesignSettingsId");

-- AddForeignKey
ALTER TABLE "ReviewRequestEmailLogo" ADD CONSTRAINT "ReviewRequestEmailLogo_emailDesignSettingsId_fkey" FOREIGN KEY ("emailDesignSettingsId") REFERENCES "EmailDesignSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
