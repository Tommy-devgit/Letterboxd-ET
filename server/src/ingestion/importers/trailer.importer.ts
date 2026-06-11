import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrailerImporter {
  private readonly logger = new Logger(TrailerImporter.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Link orphaned SODERE trailer sources to their parent Movie rows.
   *
   * A "trailer source" is a MovieSource row with movieId=null whose slug
   * maps back to a movie. Strategy:
   *   1. Extract the trailer's slug from scrapedData (entity.slug for
   *      collection items, url/slug for featured items).
   *   2. Strip known trailer suffixes to derive the parent movie slug.
   *   3. Look up a Movie with that exact slug.
   *   4. If found: create a MovieTrailer record and link the source.
   *
   * Examples that should link:
   *   "yene-ken-trailer"          → "yene-ken"
   *   "zare-abeba-trailer"        → "zare-abeba"
   *   "leenatu-ethiopian-film-trailer" → "leenatu"
   *   "wesedegntrailer"           → "wesedegn"  (no hyphen)
   *   "tef-tef-trelir-2"          → "tef-tef"   (Amharic word for trailer)
   */
  async linkOrphanedTrailers(): Promise<number> {
    const orphans = await this.prisma.movieSource.findMany({
      where: { movieId: null, sourceName: 'SODERE' },
      select: { id: true, scrapedData: true },
    });

    let linked = 0;

    for (const source of orphans) {
      const rawSlug = extractSlugFromSource(source.scrapedData as Record<string, unknown>);
      if (!rawSlug) continue;

      const parentSlug = deriveParentSlug(rawSlug);
      if (!parentSlug || parentSlug === rawSlug) continue;

      const movie = await this.prisma.movie.findFirst({
        where: { slug: parentSlug },
        select: { id: true, title: true },
      });
      if (!movie) continue;

      // Create a MovieTrailer record if we can extract a title
      const trailerTitle = buildTrailerTitle(movie.title, rawSlug);
      const trailerUrl = extractTrailerPageUrl(source.scrapedData as Record<string, unknown>);

      if (trailerUrl) {
        const exists = await this.prisma.movieTrailer.findFirst({
          where: { movieId: movie.id, youtubeUrl: trailerUrl },
          select: { id: true },
        });
        if (!exists) {
          await this.prisma.movieTrailer.create({
            data: { movieId: movie.id, title: trailerTitle, youtubeUrl: trailerUrl },
          });
        }
      }

      // Link the orphan source row to the parent movie
      await this.prisma.movieSource.update({
        where: { id: source.id },
        data: { movieId: movie.id },
      });

      linked++;
      this.logger.debug(`Linked trailer "${rawSlug}" → movie "${movie.title}" (${movie.id})`);
    }

    return linked;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pull slug out of the raw scraped blob regardless of which endpoint produced it. */
function extractSlugFromSource(data: Record<string, unknown>): string {
  // Collection item: data.entity.slug
  const entity = data['entity'] as Record<string, unknown> | undefined;
  const entitySlug = (entity?.['slug'] as string | undefined)?.trim();
  if (entitySlug) return entitySlug;

  // Featured item: data.slug or data.url
  const directSlug = (data['slug'] as string | undefined)?.trim();
  if (directSlug) return directSlug;

  const urlField = (data['url'] as string | undefined)?.trim();
  if (urlField) return urlField;

  return '';
}

/** Pull the page URL for the trailer video. */
function extractTrailerPageUrl(data: Record<string, unknown>): string {
  // Collection entity: entity.page_url
  const entity = data['entity'] as Record<string, unknown> | undefined;
  const pageUrl = (entity?.['page_url'] as string | undefined)?.trim();
  if (pageUrl) return pageUrl;

  // Featured item: _links.video_page.href or _links.collection_page.href
  const links = data['_links'] as Record<string, unknown> | undefined;
  const videoPage = (links?.['video_page'] as Record<string, unknown> | undefined);
  const href = (videoPage?.['href'] as string | undefined)?.trim();
  if (href) return href;

  return '';
}

/**
 * Strip trailer suffixes from a slug to get the parent movie slug.
 *
 * Handles:
 *   -trailer            yene-ken-trailer → yene-ken
 *   -trailer-N          tef-tef-trelir-2 → tef-tef   (via trelir)
 *   trailer (no hyphen) wesedegntrailer  → wesedegn
 *   -teaser             foo-teaser       → foo
 *   -ethiopian-film-trailer leenatu-ethiopian-film-trailer → leenatu
 */
function deriveParentSlug(slug: string): string {
  let s = slug;

  // Pass 1 — strip trailer/teaser suffixes first.
  // Must come before qualifier stripping so "leenatu-ethiopian-film-trailer"
  // becomes "leenatu-ethiopian-film" and then "leenatu" in pass 2.
  s = s.replace(/-trelir(-\d+)?$/, '');    // Amharic word for trailer
  s = s.replace(/-trailer(-\d+)?$/, '');
  s = s.replace(/-teaser(-\d+)?$/, '');
  s = s.replace(/trailer(-\d+)?$/, '');    // no-hyphen: "wesedegntrailer" → "wesedegn"

  // Pass 2 — strip platform/qualifier suffixes revealed after pass 1.
  s = s.replace(/-ethiopian-film(-\d+)?$/, '');
  s = s.replace(/-ethiopian-movie(-\d{4})?$/, '');
  s = s.replace(/-full-movie$/, '');
  s = s.replace(/-full$/, '');

  return s.replace(/-+$/, '');
}

function buildTrailerTitle(movieTitle: string, trailerSlug: string): string {
  const suffix = trailerSlug.match(/-(\d+)$/)?.[1];
  return suffix ? `${movieTitle} - Trailer ${suffix}` : `${movieTitle} - Trailer`;
}
