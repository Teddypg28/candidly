/*
  Warnings:

  - The primary key for the `AppSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CurrentOrdersStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExcludedProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProductReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProductReviewMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RadioAnswerChoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReviewFormQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReviewFormSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReviewRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReviewRequestEmailSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Reward` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RewardSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SavedCustomQuestionTableView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SavedReviewRequestTableView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SavedReviewsTableViews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TextAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AnswerChoiceSnapshot" DROP CONSTRAINT "AnswerChoiceSnapshot_questionId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerChoiceSnapshot" DROP CONSTRAINT "AnswerChoiceSnapshot_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ExcludedProduct" DROP CONSTRAINT "ExcludedProduct_rewardSettingId_fkey";

-- DropForeignKey
ALTER TABLE "ProductReviewMedia" DROP CONSTRAINT "ProductReviewMedia_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "RadioAnswerChoice" DROP CONSTRAINT "RadioAnswerChoice_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequestEmailLogo" DROP CONSTRAINT "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_goodId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_perfectId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_subparId_fkey";

-- DropForeignKey
ALTER TABLE "TextAnswer" DROP CONSTRAINT "TextAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TextAnswer" DROP CONSTRAINT "TextAnswer_reviewId_fkey";

-- AlterTable
ALTER TABLE "AnswerChoiceSnapshot" ALTER COLUMN "reviewId" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "AppSettings" DROP CONSTRAINT "AppSettings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AppSettings_id_seq";

-- AlterTable
ALTER TABLE "CurrentOrdersStatus" DROP CONSTRAINT "CurrentOrdersStatus_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CurrentOrdersStatus_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CurrentOrdersStatus_id_seq";

-- AlterTable
ALTER TABLE "ExcludedProduct" DROP CONSTRAINT "ExcludedProduct_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "rewardSettingId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExcludedProduct_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExcludedProduct_id_seq";

-- AlterTable
ALTER TABLE "ProductReview" DROP CONSTRAINT "ProductReview_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductReview_id_seq";

-- AlterTable
ALTER TABLE "ProductReviewMedia" DROP CONSTRAINT "ProductReviewMedia_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "reviewId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductReviewMedia_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductReviewMedia_id_seq";

-- AlterTable
ALTER TABLE "RadioAnswerChoice" DROP CONSTRAINT "RadioAnswerChoice_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RadioAnswerChoice_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RadioAnswerChoice_id_seq";

-- AlterTable
ALTER TABLE "ReviewFormQuestion" DROP CONSTRAINT "ReviewFormQuestion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReviewFormQuestion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReviewFormQuestion_id_seq";

-- AlterTable
ALTER TABLE "ReviewFormSettings" DROP CONSTRAINT "ReviewFormSettings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReviewFormSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReviewFormSettings_id_seq";

-- AlterTable
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReviewRequest_id_seq";

-- AlterTable
ALTER TABLE "ReviewRequestEmailLogo" ALTER COLUMN "reviewRequestEmailSettingsId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ReviewRequestEmailSettings" DROP CONSTRAINT "ReviewRequestEmailSettings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReviewRequestEmailSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReviewRequestEmailSettings_id_seq";

-- AlterTable
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "goodId" SET DATA TYPE TEXT,
ALTER COLUMN "perfectId" SET DATA TYPE TEXT,
ALTER COLUMN "subparId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Reward_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Reward_id_seq";

-- AlterTable
ALTER TABLE "RewardSetting" DROP CONSTRAINT "RewardSetting_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RewardSetting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RewardSetting_id_seq";

-- AlterTable
ALTER TABLE "SavedCustomQuestionTableView" DROP CONSTRAINT "SavedCustomQuestionTableView_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SavedCustomQuestionTableView_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SavedCustomQuestionTableView_id_seq";

-- AlterTable
ALTER TABLE "SavedReviewRequestTableView" DROP CONSTRAINT "SavedReviewRequestTableView_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SavedReviewRequestTableView_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SavedReviewRequestTableView_id_seq";

-- AlterTable
ALTER TABLE "SavedReviewsTableViews" DROP CONSTRAINT "SavedReviewsTableViews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SavedReviewsTableViews_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SavedReviewsTableViews_id_seq";

-- AlterTable
ALTER TABLE "TextAnswer" DROP CONSTRAINT "TextAnswer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ALTER COLUMN "reviewId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TextAnswer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TextAnswer_id_seq";

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerChoiceSnapshot" ADD CONSTRAINT "AnswerChoiceSnapshot_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioAnswerChoice" ADD CONSTRAINT "RadioAnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextAnswer" ADD CONSTRAINT "TextAnswer_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextAnswer" ADD CONSTRAINT "TextAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewFormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequestEmailLogo" ADD CONSTRAINT "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_fkey" FOREIGN KEY ("reviewRequestEmailSettingsId") REFERENCES "ReviewRequestEmailSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcludedProduct" ADD CONSTRAINT "ExcludedProduct_rewardSettingId_fkey" FOREIGN KEY ("rewardSettingId") REFERENCES "RewardSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_subparId_fkey" FOREIGN KEY ("subparId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_perfectId_fkey" FOREIGN KEY ("perfectId") REFERENCES "RewardSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
