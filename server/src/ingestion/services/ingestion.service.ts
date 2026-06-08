import { Injectable, Logger } from '@nestjs/common';
import { transformSodereFile } from '../transformers/sodere/sodere.transformer';
import { MovieImporter } from '../importers/movie.importer';
import { TrailerImporter } from '../importers/trailer.importer';

export interface IngestionStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  trailersLinked: number;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly movieImporter: MovieImporter,
    private readonly trailerImporter: TrailerImporter,
  ) {}

  async ingestSodereFile(filePath: string): Promise<IngestionStats> {
    this.logger.log(`Starting Sodere ingestion from ${filePath}`);

    const dtos = await transformSodereFile(filePath);
    this.logger.log(`Transformed ${dtos.length} items`);

    const stats: IngestionStats = {
      total: dtos.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      trailersLinked: 0,
    };

    for (const dto of dtos) {
      try {
        const result = await this.movieImporter.import(dto);
        if (result.skipped) {
          stats.skipped++;
        } else if (result.isNew) {
          stats.imported++;
        } else {
          stats.skipped++;
        }
      } catch (err) {
        stats.errors++;
        this.logger.error(`Failed to import "${dto.title}" [${dto.externalId}]: ${String(err)}`);
      }
    }

    // Second pass: link trailer orphans to their parent movies
    stats.trailersLinked = await this.trailerImporter.linkOrphanedTrailers();

    this.logger.log(
      `Done — imported: ${stats.imported}, skipped: ${stats.skipped}, ` +
        `errors: ${stats.errors}, trailers linked: ${stats.trailersLinked}`,
    );

    return stats;
  }
}
