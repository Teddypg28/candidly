-- CreateTable
CREATE TABLE "OnboardingDismissalState" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingDismissalState_pkey" PRIMARY KEY ("id")
);
