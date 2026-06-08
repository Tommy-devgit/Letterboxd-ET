import * as fs from 'fs';
import * as readline from 'readline';
import type { ContentType, MovieDTO, MovieSourceDTO } from '../../dto';
import type { SodereApiResponse, SodereEntity, SodereItem, SodereRawEntry } from './sodere.types';

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

function normalizeSlug(raw: string | undefined, fallback: string): string {
  const base = raw?.trim() || slugify(fallback);
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Content-type classifier
// ---------------------------------------------------------------------------

export function classifyContent(item: SodereItem, entity: SodereEntity): ContentType {
  const title = (entity.title ?? entity.name ?? item.title ?? '').toLowerCase();
  const slug = (entity.slug ?? item.slug ?? '').toLowerCase();
  const type = (entity.type ?? item.type ?? '').toLowerCase();

  if (title.includes('trailer') || slug.includes('trailer')) return 'TRAILER';
  if (title.includes(' short') || slug.endsWith('-short')) return 'SHORT';
  if (type === 'series') return 'SERIES';
  if (type === 'video' || type === 'movie') return 'MOVIE';

  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Single-item transformer
// ---------------------------------------------------------------------------

function extractThumbnail(entity: SodereEntity): string | undefined {
  const t = entity.thumbnail;
  if (!t || typeof t !== 'object') return undefined;
  return t.large ?? t['x-large'] ?? t.medium ?? t.small ?? undefined;
}

export function transformSodereItem(item: SodereItem, sourceUrl: string): MovieDTO | null {
  const entity: SodereEntity = item.entity ?? {};

  const rawId = entity.id ?? item.id;
  if (rawId === undefined || rawId === null) return null;
  const externalId = String(rawId);

  const title = (entity.title ?? entity.name ?? item.title ?? '').trim();
  if (!title) return null;

  const slug = normalizeSlug(entity.slug ?? item.slug, title);
  if (!slug) return null;

  const contentType = classifyContent(item, entity);

  const runtimeMinutes =
    typeof entity.duration === 'number' && entity.duration > 0
      ? Math.round(entity.duration / 60)
      : undefined;

  const source: MovieSourceDTO = {
    sourceName: 'SODERE',
    externalId,
    sourceUrl,
    scrapedData: item as Record<string, unknown>,
  };

  return {
    externalId,
    title,
    slug,
    synopsis: entity.description?.trim() || undefined,
    runtimeMinutes,
    posterUrl: extractThumbnail(entity),
    contentType,
    genres: [],
    credits: [],
    trailers: [],
    source,
  };
}

// ---------------------------------------------------------------------------
// Full JSONL file transformer
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

    // Only process collection item feeds from VHX API
    if (!url.includes('collections') || !url.includes('items')) continue;

    const items: SodereItem[] =
      (data as SodereApiResponse).items ??
      (data as SodereApiResponse)._embedded?.items ??
      [];

    for (const item of items) {
      const dto = transformSodereItem(item, url);
      if (!dto) continue;
      if (seenIds.has(dto.externalId)) continue;

      seenIds.add(dto.externalId);
      results.push(dto);
    }
  }

  return results;
}
