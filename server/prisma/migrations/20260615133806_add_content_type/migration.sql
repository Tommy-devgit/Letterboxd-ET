-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'SERIES', 'SHORT', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'MOVIE';
