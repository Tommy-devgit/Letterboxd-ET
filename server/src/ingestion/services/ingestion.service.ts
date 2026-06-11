import { Injectable, Logger } from '@nestjs/common';
import { transformSodereFile } from '../transformers/sodere/sodere.transformer';
import { MovieImporter } from '../importers/movie.importer';
import { TrailerImporter } from '../importers/trailer.importer';

export interface IngestionStats {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  trailerSourcesStored: number;
  errors: number;
  trailersLinked: number;
  imagesFound: number;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly movieImporter: MovieImporter,
    private readonly trailerImporter: TrailerImporter,
  ) {}

  async ingestSodereFile(filePath: string): Promise<IngestionStats> {
    this.logger.log(`Starting Sodere ingestion from: ${filePath}`);

    const dtos = await transformSodereFile(filePath);
    this.logger.log(`Transformed ${dtos.length} items (${dtos.filter(d => d.contentType !== 'TRAILER').length} movies, ${dtos.filter(d => d.contentType === 'TRAILER').length} trailers)`);

    const stats: IngestionStats = {
      total: dtos.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      trailerSourcesStored: 0,
      errors: 0,
      trailersLinked: 0,
      imagesFound: 0,
    };

    for (const dto of dtos) {
      try {
        const result = await this.movieImporter.import(dto);

        if (dto.contentType === 'TRAILER') {
          if (!result.skipped) stats.trailerSourcesStored++;
          else stats.skipped++;
        } else if (result.skipped) {
          stats.skipped++;
        } else if (result.updated) {
          stats.updated++;
        } else if (result.isNew) {
          stats.imported++;
        } else {
          stats.skipped++;
        }

        if (dto.posterUrl) stats.imagesFound++;
      } catch (err) {
        stats.errors++;
        this.logger.error(
          `Failed to import "${dto.title}" [${dto.externalId}]: ${String(err)}`,
        );
      }
    }

    // Second pass: link orphaned trailer sources to their parent movies
    stats.trailersLinked = await this.trailerImporter.linkOrphanedTrailers();

    this.logger.log(
      `Done — imported: ${stats.imported}, updated: ${stats.updated}, ` +
        `skipped: ${stats.skipped}, trailerSources: ${stats.trailerSourcesStored}, ` +
        `trailersLinked: ${stats.trailersLinked}, images: ${stats.imagesFound}, errors: ${stats.errors}`,
    );

    return stats;
  }
}
