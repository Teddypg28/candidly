-- CreateTable
CREATE TABLE "DisplayProduct" (
    "id" SERIAL NOT NULL,
    "store" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "appSettingsId" INTEGER NOT NULL,

    CONSTRAINT "DisplayProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisplayProduct" ADD CONSTRAINT "DisplayProduct_appSettingsId_fkey" FOREIGN KEY ("appSettingsId") REFERENCES "AppSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
