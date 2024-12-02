-- CreateTable
CREATE TABLE "ReviewRequestEmailLogo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reviewRequestEmailSettingsId" INTEGER NOT NULL,

    CONSTRAINT "ReviewRequestEmailLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_key" ON "ReviewRequestEmailLogo"("reviewRequestEmailSettingsId");

-- AddForeignKey
ALTER TABLE "ReviewRequestEmailLogo" ADD CONSTRAINT "ReviewRequestEmailLogo_reviewRequestEmailSettingsId_fkey" FOREIGN KEY ("reviewRequestEmailSettingsId") REFERENCES "ReviewRequestEmailSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
