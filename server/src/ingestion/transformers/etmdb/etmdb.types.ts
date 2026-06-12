// ---------------------------------------------------------------------------
// Raw SQLite row shapes returned by better-sqlite3
// Column names match etmdb.db exactly — do NOT rename.
// ---------------------------------------------------------------------------

export interface EtmdbMovieRow {
  id: number;
  title: string;
  original_title: string | null;
  slug: string;
  overview: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string | null;
  release_year: number | null;
  runtime: number | null;
  spoken_languages: string | null; // JSON string e.g. '["am"]'
  countries: string | null;        // JSON string e.g. '[]'
  tmdb_id: number | null;
  imdb_id: string | null;
  wikidata_id: string | null;
  wikipedia_url: string | null;
  source: string | null;
  tmdb_rating: number | null;
  tmdb_votes: number | null;
  type: 'movie' | 'series';
  created_at: string;
  updated_at: string;
}

export interface EtmdbPersonRow {
  id: number;
  name: string;
  name_am: string | null;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  tmdb_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface EtmdbCreditRow {
  id: number;
  movie_id: number;
  person_id: number;
  role: string;
  character_name: string | null;
  sort_order: number;
}

export interface EtmdbGenreRow {
  id: number;
  name: string;
  name_am: string | null;
  slug: string;
}

export interface EtmdbMovieGenreRow {
  movie_id: number;
  genre_id: number;
}

export interface EtmdbYoutubeLinkRow {
  id: number;
  video_id: string;
  title: string;
  channel_title: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  embeddable: number; // SQLite stores BOOLEAN as 0/1
  language: string | null;
  movie_id: number | null;
  is_primary: number; // 0/1
  match_confidence: number | null;
}

// ---------------------------------------------------------------------------
// Enriched row: movie joined with its credits and trailers
// ---------------------------------------------------------------------------
export interface EtmdbMovieWithRelations extends EtmdbMovieRow {
  credits: Array<EtmdbCreditRow & { person: EtmdbPersonRow }>;
  genres: EtmdbGenreRow[];
  trailers: EtmdbYoutubeLinkRow[];
}
