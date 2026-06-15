import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EtmdbIngestionService, EtmdbIngestionStats } from './etmdb-ingestion.service';

export interface SyncResult extends EtmdbIngestionStats {
  syncedAt: string;
}

@Injectable()
export class MetadataSyncService {
  private readonly logger = new Logger(MetadataSyncService.name);

  constructor(
    private readonly etmdbIngestionService: EtmdbIngestionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Re-run the full ETMDB ingestion against the given database file.
   * Idempotent — safe to call multiple times.
   *
   * Preserved (never touched): Rating, Review, DiaryEntry, Watchlist, List.
   * Updated: title, synopsis, poster, backdrop, credits, trailers, genres, external IDs.
   */
  async syncAll(dbPath: string): Promise<SyncResult> {
    this.logger.log(`Full metadata sync started from: ${dbPath}`);
    const stats = await this.etmdbIngestionService.ingestDatabase(dbPath);
    this.logger.log(`Full metadata sync complete — ${stats.moviesImported} new, ${stats.moviesUpdated} updated`);
    return { ...stats, syncedAt: new Date().toISOString() };
  }

  /**
   * Return current database row counts — useful for before/after verification.
   */
  async getTableCounts(): Promise<Record<string, number>> {
    const [movies, genres, persons, credits, trailers, sources, ratings, reviews, diaryEntries, watchlists, lists] =
      await Promise.all([
        this.prisma.movie.count(),
        this.prisma.genre.count(),
        this.prisma.person.count(),
        this.prisma.movieCredit.count(),
        this.prisma.movieTrailer.count(),
        this.prisma.movieSource.count(),
        this.prisma.rating.count(),
        this.prisma.review.count(),
        this.prisma.diaryEntry.count(),
        this.prisma.watchlist.count(),
        this.prisma.list.count(),
      ]);
    return { movies, genres, persons, credits, trailers, sources, ratings, reviews, diaryEntries, watchlists, lists };
  }
}
