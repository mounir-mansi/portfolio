-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "activity" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'contact',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;
