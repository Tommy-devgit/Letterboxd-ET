import * as fs from 'fs';
import * as readline from 'readline';
import type { ContentType, MovieDTO, MovieSourceDTO } from '../../dto';
import type {
  SodereCollectionEntity,
  SodereCollectionItem,
  SodereCollectionResponse,
  SodereFeaturedItem,
  SodereFeaturedResponse,
  SodereRawEntry,
  SodereThumbnail,
} from './sodere.types';

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Strip streaming-site suffixes that don't belong in a canonical movie slug.
 * "bemenore-full-movie" → "bemenore"
 * "leba-felagi-ethiopian-movie-2024" → "leba-felagi"
 */
function cleanVideoSlug(slug: string): string {
  return slug
    .replace(/-full-movie(-\d+)?$/, '')
    .replace(/-ethiopian-movie(-\d{4})?$/, '')
    .replace(/-ethiopian-film(-\d{4})?$/, '')
    .replace(/-full$/, '');
}

/**
 * Extract the canonical slug for a featured item.
 * Priority: item.slug > cleaned item.url > _links page slug > slugify(title)
 */
function extractFeaturedSlug(item: SodereFeaturedItem, fallbackTitle: string): string {
  if (item.slug?.trim()) return normalizeSlug(item.slug.trim());

  if (item.url?.trim()) {
    const cleaned = cleanVideoSlug(item.url.trim());
    if (cleaned) return normalizeSlug(cleaned);
  }

  const href =
    item._links?.collection_page?.href || item._links?.video_page?.href || '';
  if (href) {
    const part = href.replace(/\/$/, '').split('/').pop() || '';
    if (part) return normalizeSlug(cleanVideoSlug(part));
  }

  return normalizeSlug(slugify(fallbackTitle));
}

// ---------------------------------------------------------------------------
// Title helpers
// ---------------------------------------------------------------------------

/**
 * Strip platform-specific suffixes from titles.
 * "Bemenore Full Movie" → "Bemenore"
 * "LenaFI Ethiopian Film Trailer" → "LenaFI"
 */
function cleanTitle(raw: string): string {
  return raw
    .replace(/\s+full\s+movie\b/gi, '')
    .replace(/\s+ethiopian\s+movie(\s+\d{4})?\b/gi, '')
    .replace(/\s+ethiopian\s+film(\s+\d{4})?\b/gi, '')
    .replace(/\s*[-–]\s*trailer\b/gi, '')
    .replace(/\s+trailer\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Image extraction helpers
// ---------------------------------------------------------------------------

function pickThumbnail(thumb: SodereThumbnail | undefined | null): string | undefined {
  if (!thumb || typeof thumb !== 'object') return undefined;
  return thumb.large ?? thumb.source ?? thumb.medium ?? thumb.small ?? undefined;
}

/**
 * Extract poster URL from a collection entity (thumbnails.16_9).
 * Line 1 items store thumbnails under a keyed aspect-ratio object.
 */
function extractCollectionThumbnail(entity: SodereCollectionEntity): string | undefined {
  const thumbs = entity.thumbnails;
  if (!thumbs) return undefined;
  const t16 = thumbs['16_9'] ?? thumbs['2_3'];
  return pickThumbnail(t16);
}

// ---------------------------------------------------------------------------
// Content-type classifiers
// ---------------------------------------------------------------------------

function classifyByTitleAndSlug(title: string, slug: string): ContentType {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();
  if (t.includes('trailer') || s.includes('trailer') || t.includes('trelir') || s.includes('trelir')) return 'TRAILER';
  if (t.includes(' short') || s.endsWith('-short')) return 'SHORT';
  return 'UNKNOWN';
}

/**
 * Classify a collection entity item.
 * entity.trailer = true is the most reliable signal.
 */
function classifyCollectionEntity(entity: SodereCollectionEntity): ContentType {
  if (entity.trailer === true) return 'TRAILER';

  const type = (entity.type ?? '').toLowerCase();
  if (type === 'series') return 'SERIES';
  if (type === 'video') return 'MOVIE';

  const title = entity.title ?? entity.name ?? '';
  const slug = entity.slug ?? '';
  return classifyByTitleAndSlug(title, slug);
}

/**
 * Classify a featured_items entry.
 * type="movie"/"series" is authoritative here.
 * Short duration (<300s) + no type → likely trailer/ad.
 */
function classifyFeaturedItem(item: SodereFeaturedItem): ContentType {
  const type = (item.type ?? '').toLowerCase();
  if (type === 'movie') return 'MOVIE';
  if (type === 'series') return 'SERIES';

  const title = item.name ?? item.title ?? '';
  const slug = item.slug ?? item.url ?? '';
  const titleSlugClassification = classifyByTitleAndSlug(title, slug);
  if (titleSlugClassification !== 'UNKNOWN') return titleSlugClassification;

  // Video type: distinguish movie files from trailers/ads by duration
  const seconds = item.duration?.seconds ?? item.seconds_count ?? 0;
  if (type === 'video' && seconds > 900) return 'MOVIE'; // >15 min = movie
  if (type === 'video' && seconds > 0 && seconds < 300) return 'TRAILER'; // <5 min = trailer/ad

  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Line 1 transformer: collections/{id}/items endpoint
// ---------------------------------------------------------------------------

function transformCollectionItem(
  item: SodereCollectionItem,
  sourceUrl: string,
): MovieDTO | null {
  const entity = item.entity;
  if (!entity) return null;

  const rawId = entity.id ?? item.id;
  if (rawId === undefined || rawId === null) return null;
  const externalId = String(rawId);

  const rawTitle = (entity.title ?? entity.name ?? '').trim();
  if (!rawTitle) return null;

  const rawSlug = entity.slug?.trim() ?? '';
  if (!rawSlug) return null;
  const slug = normalizeSlug(rawSlug);
  if (!slug) return null;

  const contentType = classifyCollectionEntity(entity);

  const durationSeconds = entity.duration?.seconds ?? 0;
  const runtimeMinutes = durationSeconds > 60 ? Math.round(durationSeconds / 60) : undefined;

  const posterUrl = extractCollectionThumbnail(entity);

  const source: MovieSourceDTO = {
    sourceName: 'SODERE',
    externalId,
    sourceUrl: entity.page_url ?? sourceUrl,
    scrapedData: item as unknown as Record<string, unknown>,
  };

  return {
    externalId,
    title: rawTitle,
    slug,
    synopsis: entity.description?.trim() || entity.short_description?.trim() || undefined,
    runtimeMinutes,
    posterUrl,
    contentType,
    genres: [],
    credits: [],
    trailers: [],
    source,
  };
}

// ---------------------------------------------------------------------------
// Line 3 transformer: products/featured_items endpoint
// ---------------------------------------------------------------------------

function transformFeaturedItem(
  item: SodereFeaturedItem,
  sourceUrl: string,
): MovieDTO | null {
  if (!item.id) return null;
  const externalId = String(item.id);

  const rawTitle = (item.name ?? item.title ?? '').trim();
  if (!rawTitle) return null;

  const cleanedTitle = cleanTitle(rawTitle);
  if (!cleanedTitle) return null;

  const slug = extractFeaturedSlug(item, cleanedTitle);
  if (!slug) return null;

  const contentType = classifyFeaturedItem(item);

  const durationSeconds = item.duration?.seconds ?? item.seconds_count ?? 0;
  const runtimeMinutes =
    typeof durationSeconds === 'number' && durationSeconds > 60
      ? Math.round(durationSeconds / 60)
      : undefined;

  const posterUrl = pickThumbnail(item.thumbnail);

  const synopsis =
    item.short_description?.trim() || item.description?.trim() || undefined;

  // Sodere provides a direct URL to the trailer — store it as a MovieTrailer record
  const trailers =
    item.trailer_url?.trim()
      ? [{ title: `${cleanedTitle} - Trailer`, youtubeUrl: item.trailer_url.trim() }]
      : [];

  const pageUrl =
    item._links?.collection_page?.href ??
    item._links?.video_page?.href ??
    sourceUrl;

  const source: MovieSourceDTO = {
    sourceName: 'SODERE',
    externalId,
    sourceUrl: pageUrl,
    scrapedData: item as unknown as Record<string, unknown>,
  };

  return {
    externalId,
    title: cleanedTitle,
    slug,
    synopsis,
    runtimeMinutes,
    posterUrl,
    contentType,
    genres: [],
    credits: [],
    trailers,
    source,
  };
}

// ---------------------------------------------------------------------------
// Entry-point: transform a full JSONL file
// ---------------------------------------------------------------------------

export async function transformSodereFile(filePath: string): Promise<MovieDTO[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Sodere JSONL file not found: ${filePath}`);
  }

  const results: MovieDTO[] = [];
  const seenIds = new Set<string>();

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry: SodereRawEntry;
    try {
      entry = JSON.parse(trimmed) as SodereRawEntry;
    } catch {
      continue;
    }

    const { url, data } = entry;
    if (!url || !data) continue;

    // ------------------------------------------------------------------
    // Route to the correct extractor based on the API endpoint
    // ------------------------------------------------------------------

    if (url.includes('collections') && url.includes('items')) {
      // Line 1: collection item feed (all trailers in our sample)
      const items = (data as SodereCollectionResponse).items ?? [];
      for (const item of items) {
        const dto = transformCollectionItem(item, url);
        if (!dto || seenIds.has(dto.externalId)) continue;
        seenIds.add(dto.externalId);
        results.push(dto);
      }
      continue;
    }

    if (url.includes('featured_items') || url.includes('_embedded')) {
      // Line 3: featured_items endpoint — flat items under _embedded
      const embedded = (data as SodereFeaturedResponse)._embedded;
      const items: SodereFeaturedItem[] = embedded?.items ?? [];
      for (const item of items) {
        const dto = transformFeaturedItem(item, url);
        if (!dto || seenIds.has(dto.externalId)) continue;
        seenIds.add(dto.externalId);
        results.push(dto);
      }
      continue;
    }

    // Fallback: try both structures
    const collectionItems = (data as SodereCollectionResponse).items;
    const embeddedItems = (data as SodereFeaturedResponse)._embedded?.items;

    if (collectionItems?.length) {
      for (const item of collectionItems) {
        const dto = transformCollectionItem(item as SodereCollectionItem, url);
        if (!dto || seenIds.has(dto.externalId)) continue;
        seenIds.add(dto.externalId);
        results.push(dto);
      }
    } else if (embeddedItems?.length) {
      for (const item of embeddedItems) {
        const dto = transformFeaturedItem(item, url);
        if (!dto || seenIds.has(dto.externalId)) continue;
        seenIds.add(dto.externalId);
        results.push(dto);
      }
    }
  }

  return results;
}
