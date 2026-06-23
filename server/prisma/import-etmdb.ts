import path from "path";
import { PrismaService } from "../src/prisma/prisma.service";
import { GenreImporter } from "../src/ingestion/importers/genre.importer";
import { PersonImporter } from "../src/ingestion/importers/person.importer";
import { MovieImporter } from "../src/ingestion/importers/movie.importer";
import { EtmdbIngestionService } from "../src/ingestion/services/etmdb-ingestion.service";

async function main() {
  const dbPath = process.argv[2] ?? path.resolve(__dirname, "../../..", "etmdb.db");
  const prisma = new PrismaService();
  const genreImporter = new GenreImporter(prisma);
  const personImporter = new PersonImporter(prisma);
  const movieImporter = new MovieImporter(prisma, genreImporter, personImporter);
  const ingestion = new EtmdbIngestionService(movieImporter, genreImporter);

  try {
    await prisma.$connect();
    const stats = await ingestion.ingestDatabase(dbPath);
    console.log(JSON.stringify(stats, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
