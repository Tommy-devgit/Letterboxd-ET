import * as fs from 'fs';
import Database from 'better-sqlite3';
import type { CreditRole } from '@prisma/client';
import type { ContentType, MovieDTO, MovieSourceDTO, PersonDTO } from '../../dto';
import type {
  EtmdbCreditRow,
  EtmdbGenreRow,
  EtmdbMovieRow,
  EtmdbMovieWithRelations,
  EtmdbPersonRow,
  EtmdbYoutubeLinkRow,
} from './etmdb.types';

// ---------------------------------------------------------------------------
// Role mapping
// ---------------------------------------------------------------------------

const ROLE_MAP: Record<string, CreditRole> = {
  director: 'DIRECTOR',
  actor: 'ACTOR',
  writer: 'WRITER',
  producer: 'PRODUCER',
  cinematographer: 'CINEMATOGRAPHER',
  editor: 'EDITOR',
  composer: 'COMPOSER',
};

function mapRole(raw: string): CreditRole | null {
  return ROLE_MAP[raw.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Deduplication: ETMDB has ~18 pairs of duplicate titles (one from IMDB, one
// from TMDB). Merge them into a single canonical record, preferring the row
// that has more data.
// ---------------------------------------------------------------------------

function deduplicateMovies(movies: EtmdbMovieWithRelations[]): EtmdbMovieWithRelations[] {
  // Group by normalised title + release_year
  const key = (m: EtmdbMovieWithRelations) =>
    `${m.title.toLowerCase().trim()}::${m.release_year ?? 'null'}`;

  const groups = new Map<string, EtmdbMovieWithRelations[]>();
  for (const m of movies) {
    const k = key(m);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(m);
  }

  const result: EtmdbMovieWithRelations[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    // Pick best: most non-null fields
    const scored = group.map((m) => ({
      m,
      score:
        (m.tmdb_id ? 2 : 0) +
        (m.imdb_id ? 2 : 0) +
        (m.overview ? 1 : 0) +
        (m.poster_url ? 1 : 0) +
        (m.release_date ? 1 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    const best = { ...scored[0].m };

    // Backfill missing IDs from the lower-ranked duplicate
    for (const { m } of scored.slice(1)) {
      if (!best.imdb_id && m.imdb_id) best.imdb_id = m.imdb_id;
      if (!best.tmdb_id && m.tmdb_id) best.tmdb_id = m.tmdb_id;
      if (!best.overview && m.overview) best.overview = m.overview;
      if (!best.poster_url && m.poster_url) best.poster_url = m.poster_url;
      if (!best.backdrop_url && m.backdrop_url) best.backdrop_url = m.backdrop_url;
      if (!best.release_date && m.release_date) best.release_date = m.release_date;
      // Merge credits (deduplicate by person_id + role)
      const seen = new Set(best.credits.map((c) => `${c.person_id}::${c.role}`));
      for (const c of m.credits) {
        if (!seen.has(`${c.person_id}::${c.role}`)) {
          best.credits.push(c);
          seen.add(`${c.person_id}::${c.role}`);
        }
      }
      // Merge genres
      const seenGenres = new Set(best.genres.map((g) => g.id));
      for (const g of m.genres) {
        if (!seenGenres.has(g.id)) {
          best.genres.push(g);
          seenGenres.add(g.id);
        }
      }
      // Merge trailers
      const seenTrailers = new Set(best.trailers.map((t) => t.video_id));
      for (const t of m.trailers) {
        if (!seenTrailers.has(t.video_id)) {
          best.trailers.push(t);
          seenTrailers.add(t.video_id);
        }
      }
    }
    result.push(best);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Map a single ETMDB movie row to our internal MovieDTO
// ---------------------------------------------------------------------------

function mapToMovieDTO(m: EtmdbMovieWithRelations): MovieDTO | null {
  if (!m.title?.trim()) return null;

  const credits: PersonDTO[] = m.credits
    .reduce<PersonDTO[]>((acc, c) => {
      const role = mapRole(c.role);
      if (!role) return acc;
      acc.push({
        fullName: c.person.name,
        role,
        ...(c.character_name ? { characterName: c.character_name } : {}),
        ...(c.person.photo_url ? { photoUrl: c.person.photo_url } : {}),
      });
      return acc;
    }, []);

  const trailers = m.trailers
    .filter((t) => t.is_primary === 1 || (t.match_confidence ?? 0) >= 0.7)
    .map((t) => ({
      title: t.title,
      youtubeUrl: `https://www.youtube.com/watch?v=${t.video_id}`,
    }));

  const genres = m.genres.map((g) => g.name);

  // Parse release date — ETMDB stores it as a string "YYYY-MM-DD"
  let releaseYear: number | undefined;
  if (m.release_year) {
    releaseYear = m.release_year;
  } else if (m.release_date) {
    const parsed = parseInt(m.release_date.substring(0, 4), 10);
    if (!isNaN(parsed)) releaseYear = parsed;
  }

  // spoken_languages JSON → first code
  let languageCode: string | undefined;
  if (m.spoken_languages) {
    try {
      const langs = JSON.parse(m.spoken_languages) as string[];
      if (langs.length > 0) languageCode = langs[0];
    } catch {
      // ignore
    }
  }

  const source: MovieSourceDTO = {
    sourceName: 'ETMDB',
    externalId: String(m.id),
    sourceUrl: `https://etmdb.com/en/movie/-${m.slug}`,
    scrapedData: m as unknown as Record<string, unknown>,
  };

  return {
    externalId: String(m.id),
    etmdbId: m.id,
    title: m.title.trim(),
    originalTitle: m.original_title?.trim() || undefined,
    slug: m.slug,
    synopsis: m.overview?.trim() || undefined,
    releaseYear,
    runtimeMinutes: m.runtime ?? undefined,
    posterUrl: m.poster_url || undefined,
    backdropUrl: m.backdrop_url || undefined,
    contentType: (m.type === 'series' ? 'SERIES' : 'MOVIE') as ContentType,
    genres,
    credits,
    trailers,
    source,
    languageCode,
    imdbId: m.imdb_id || undefined,
    tmdbId: m.tmdb_id ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function transformEtmdbDatabase(dbPath: string): MovieDTO[] {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`ETMDB database not found: ${dbPath}`);
  }

  const db = new Database(dbPath, { readonly: true });

  try {
    // Load all people into a map for fast join
    const personRows = db
      .prepare('SELECT * FROM person')
      .all() as EtmdbPersonRow[];
    const personMap = new Map<number, EtmdbPersonRow>(personRows.map((p) => [p.id, p]));

    // Load all credits
    const creditRows = db
      .prepare('SELECT * FROM credit ORDER BY movie_id, sort_order')
      .all() as EtmdbCreditRow[];
    const creditsByMovie = new Map<number, Array<EtmdbCreditRow & { person: EtmdbPersonRow }>>();
    for (const c of creditRows) {
      const person = personMap.get(c.person_id);
      if (!person) continue;
      if (!creditsByMovie.has(c.movie_id)) creditsByMovie.set(c.movie_id, []);
      creditsByMovie.get(c.movie_id)!.push({ ...c, person });
    }

    // Load all genres
    const genreRows = db.prepare('SELECT * FROM genre').all() as EtmdbGenreRow[];
    const genreMap = new Map<number, EtmdbGenreRow>(genreRows.map((g) => [g.id, g]));

    // Load movie_genre links
    const movieGenreRows = db
      .prepare('SELECT * FROM movie_genre')
      .all() as Array<{ movie_id: number; genre_id: number }>;
    const genresByMovie = new Map<number, EtmdbGenreRow[]>();
    for (const mg of movieGenreRows) {
      const genre = genreMap.get(mg.genre_id);
      if (!genre) continue;
      if (!genresByMovie.has(mg.movie_id)) genresByMovie.set(mg.movie_id, []);
      genresByMovie.get(mg.movie_id)!.push(genre);
    }

    // Load youtube links (only linked, primary, or high-confidence)
    const youtubeRows = db
      .prepare(
        'SELECT * FROM youtube_link WHERE movie_id IS NOT NULL AND (is_primary = 1 OR match_confidence >= 0.7)',
      )
      .all() as EtmdbYoutubeLinkRow[];
    const trailersByMovie = new Map<number, EtmdbYoutubeLinkRow[]>();
    for (const yt of youtubeRows) {
      if (yt.movie_id === null) continue;
      if (!trailersByMovie.has(yt.movie_id)) trailersByMovie.set(yt.movie_id, []);
      trailersByMovie.get(yt.movie_id)!.push(yt);
    }

    // Load all movies
    const movieRows = db.prepare('SELECT * FROM movie').all() as EtmdbMovieRow[];

    const enriched: EtmdbMovieWithRelations[] = movieRows.map((m) => ({
      ...m,
      credits: creditsByMovie.get(m.id) ?? [],
      genres: genresByMovie.get(m.id) ?? [],
      trailers: trailersByMovie.get(m.id) ?? [],
    }));

    // Deduplicate, then map to DTOs
    const deduped = deduplicateMovies(enriched);
    return deduped.map(mapToMovieDTO).filter((d): d is MovieDTO => d !== null);
  } finally {
    db.close();
  }
}
