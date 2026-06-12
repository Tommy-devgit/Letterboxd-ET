-- AlterEnum
ALTER TYPE "SourceName" ADD VALUE 'ETMDB';

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "etmdbId" INTEGER;

-- CreateIndex
CREATE INDEX "Movie_etmdbId_idx" ON "Movie"("etmdbId");

-- CreateIndex
CREATE INDEX "Movie_tmdbId_idx" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_imdbId_idx" ON "Movie"("imdbId");
