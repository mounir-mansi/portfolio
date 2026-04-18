-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_es" TEXT,
ADD COLUMN     "description_it" TEXT,
ADD COLUMN     "highlights_en" TEXT[],
ADD COLUMN     "highlights_es" TEXT[],
ADD COLUMN     "highlights_it" TEXT[],
ADD COLUMN     "longDescription_en" TEXT,
ADD COLUMN     "longDescription_es" TEXT,
ADD COLUMN     "longDescription_it" TEXT,
ADD COLUMN     "title_en" TEXT,
ADD COLUMN     "title_es" TEXT,
ADD COLUMN     "title_it" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "text_en" TEXT,
ADD COLUMN     "text_es" TEXT,
ADD COLUMN     "text_it" TEXT;
