import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrailerImporter {
  private readonly logger = new Logger(TrailerImporter.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Attempt to link orphaned SODERE trailer sources to their parent movies.
   * Strategy: strip "-trailer[-N]" suffix from the trailer's slug and look
   * for a movie whose slug contains the remainder.
   *
   * Run this after all movies have been imported so the parent rows exist.
   */
  async linkOrphanedTrailers(): Promise<number> {
    const orphans = await this.prisma.movieSource.findMany({
      where: { movieId: null, sourceName: 'SODERE' },
      select: { id: true, scrapedData: true },
    });

    let linked = 0;

    for (const source of orphans) {
      const data = source.scrapedData as Record<string, unknown>;
      const entity = (data['entity'] as Record<string, unknown> | undefined) ?? {};
      const rawSlug = String(entity['slug'] ?? '');
      if (!rawSlug) continue;

      // Strip trailing "-trailer" or "-trailer-2", "-teaser", etc.
      const parentSlug = rawSlug
        .replace(/-trailer(-\d+)?$/, '')
        .replace(/-teaser(-\d+)?$/, '');

      if (!parentSlug || parentSlug === rawSlug) continue;

      const movie = await this.prisma.movie.findFirst({
        where: { slug: parentSlug },
        select: { id: true },
      });
      if (!movie) continue;

      await this.prisma.movieSource.update({
        where: { id: source.id },
        data: { movieId: movie.id },
      });

      linked++;
      this.logger.debug(`Linked orphan source ${source.id} → movie ${movie.id}`);
    }

    return linked;
  }
}
