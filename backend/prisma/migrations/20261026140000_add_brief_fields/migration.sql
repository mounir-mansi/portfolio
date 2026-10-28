-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "aLogo" BOOLEAN,
ADD COLUMN     "briefDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "briefExpiresAt" TIMESTAMP(3),
ADD COLUMN     "briefTokenHash" TEXT,
ADD COLUMN     "couleurs" TEXT,
ADD COLUMN     "creneau" TEXT,
ADD COLUMN     "echeance" TEXT,
ADD COLUMN     "pages" TEXT[],
ADD COLUMN     "pagesAutre" TEXT,
ADD COLUMN     "theme" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ContactMessage_briefTokenHash_key" ON "ContactMessage"("briefTokenHash");

