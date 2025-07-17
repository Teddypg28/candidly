/*
  Warnings:

  - You are about to drop the column `customerQuestionEmailSettingsId` on the `ReviewRequestEmailLogo` table. All the data in the column will be lost.
  - You are about to drop the column `customerRewardEmailSettingsId` on the `ReviewRequestEmailLogo` table. All the data in the column will be lost.
  - You are about to drop the `CustomerQuestionEmailSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerRewardEmailSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_customerRewardEmailSettingsId_fkey";

-- DropIndex
DROP INDEX "ReviewRequestEmailLogo_customerQuestionEmailSettingsId_key";

-- DropIndex
DROP INDEX "ReviewRequestEmailLogo_customerRewardEmailSettingsId_key";

-- AlterTable
ALTER TABLE "ReviewRequestEmailLogo" DROP COLUMN "customerQuestionEmailSettingsId",
DROP COLUMN "customerRewardEmailSettingsId";

-- DropTable
DROP TABLE "CustomerQuestionEmailSettings";

-- DropTable
DROP TABLE "CustomerRewardEmailSettings";
