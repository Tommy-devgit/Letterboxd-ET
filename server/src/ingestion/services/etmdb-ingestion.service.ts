import { Injectable, Logger } from '@nestjs/common';
import { transformEtmdbDatabase } from '../transformers/etmdb/etmdb.transformer';
import { MovieImporter } from '../importers/movie.importer';
import { GenreImporter } from '../importers/genre.importer';

export interface EtmdbIngestionStats {
  totalMovies: number;
  imported: number;
  updated: number;
  skipped: number;
  genresImported: number;
  peopleImported: number;
  creditsImported: number;
  trailersImported: number;
  errors: number;
}

@Injectable()
export class EtmdbIngestionService {
  private readonly logger = new Logger(EtmdbIngestionService.name);

  constructor(
    private readonly movieImporter: MovieImporter,
    private readonly genreImporter: GenreImporter,
  ) {}

  async ingestDatabase(dbPath: string): Promise<EtmdbIngestionStats> {
    this.logger.log(`Starting ETMDB ingestion from: ${dbPath}`);

    const dtos = transformEtmdbDatabase(dbPath);
    this.logger.log(`Transformed ${dtos.length} movies from ETMDB`);

    const stats: EtmdbIngestionStats = {
      totalMovies: dtos.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      genresImported: 0,
      peopleImported: 0,
      creditsImported: 0,
      trailersImported: 0,
      errors: 0,
    };

    // Sync all genre definitions first so they exist for movie imports
    const allGenres = [...new Set(dtos.flatMap((d) => d.genres))];
    const genreMap = await this.genreImporter.upsertMany(allGenres);
    stats.genresImported = genreMap.size;
    this.logger.log(`Genres synced: ${stats.genresImported}`);

    // Track unique people and credits across all DTOs for stats
    const seenPeople = new Set<string>();
    let creditsCount = 0;
    let trailersCount = 0;

    for (const dto of dtos) {
      for (const c of dto.credits) seenPeople.add(c.fullName);
      creditsCount += dto.credits.length;
      trailersCount += dto.trailers.length;
    }
    stats.peopleImported = seenPeople.size;
    stats.creditsImported = creditsCount;
    stats.trailersImported = trailersCount;

    // Import movies
    for (const dto of dtos) {
      try {
        const result = await this.movieImporter.import(dto);

        if (result.skipped) {
          stats.skipped++;
        } else if (result.updated) {
          stats.updated++;
        } else if (result.isNew) {
          stats.imported++;
        } else {
          stats.skipped++;
        }
      } catch (err) {
        stats.errors++;
        this.logger.error(`Failed to import "${dto.title}" [etmdbId=${dto.etmdbId}]: ${String(err)}`);
      }
    }

    this.logger.log(
      `ETMDB done — imported: ${stats.imported}, updated: ${stats.updated}, ` +
        `skipped: ${stats.skipped}, genres: ${stats.genresImported}, ` +
        `people: ${stats.peopleImported}, credits: ${stats.creditsImported}, ` +
        `trailers: ${stats.trailersImported}, errors: ${stats.errors}`,
    );

    return stats;
  }
}
