-- AlterTable (réexécutable : IF NOT EXISTS). Nom de famille de l'auteur : visible dans l'admin seulement, jamais publié (le site n'affiche que l'initiale).
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
