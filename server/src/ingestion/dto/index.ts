import type { CreditRole, SourceName } from '@prisma/client';

export type ContentType = 'MOVIE' | 'SERIES' | 'SHORT' | 'TRAILER' | 'UNKNOWN';

export interface GenreDTO {
  name: string;
}

export interface PersonDTO {
  externalId?: string;
  fullName: string;
  photoUrl?: string;
  role: CreditRole;
  characterName?: string;
}

export interface TrailerDTO {
  title: string;
  youtubeUrl: string;
}

export interface MovieSourceDTO {
  sourceName: SourceName;
  externalId: string;
  sourceUrl: string;
  scrapedData: Record<string, unknown>;
}

export interface MovieDTO {
  externalId: string;
  title: string;
  originalTitle?: string;
  slug: string;
  synopsis?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  posterUrl?: string;
  backdropUrl?: string;
  contentType: ContentType;
  genres: string[];
  credits: PersonDTO[];
  trailers: TrailerDTO[];
  source: MovieSourceDTO;
  countryCode?: string;
  languageCode?: string;
  // External IDs — populated by ETMDB transformer for cross-source matching
  etmdbId?: number;
  imdbId?: string;
  tmdbId?: number;
}
