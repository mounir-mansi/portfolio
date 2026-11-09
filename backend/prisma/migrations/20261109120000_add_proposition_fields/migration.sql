-- AlterTable (réexécutable : IF NOT EXISTS)
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "ajouts" TEXT[],
ADD COLUMN IF NOT EXISTS "propositions" TEXT[],
ADD COLUMN IF NOT EXISTS "prospectCode" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContactMessage_prospectCode_idx" ON "ContactMessage"("prospectCode");
