// ─── Shared API types ────────────────────────────────────────────────────────

export interface Genre {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  fullName: string;
  bio?: string | null;
  photoUrl?: string | null;
  birthDate?: string | null;
  creditCount?: number;
}

export interface MovieCredit {
  id: string;
  role: 'ACTOR' | 'DIRECTOR' | 'WRITER' | 'PRODUCER' | 'CINEMATOGRAPHER' | 'EDITOR' | 'COMPOSER';
  characterName?: string | null;
  person: Person;
}

export interface MovieTrailer {
  id: string;
  title: string;
  youtubeUrl: string;
}

export interface MovieSummary {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  releaseYear?: number | null;
  releaseDate?: string | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  runtimeMinutes?: number | null;
  averageRating: number;
  ratingsCount: number;
  reviewCount?: number;
  genres: string[];
  directors: string[];
}

export interface MovieDetail extends MovieSummary {
  imdbId?: string | null;
  tmdbId?: number | null;
  etmdbId?: number | null;
  country?: { id: string; name: string; code: string } | null;
  language?: { id: string; name: string; code: string } | null;
  credits: MovieCredit[];
  trailers: MovieTrailer[];
  sources?: Array<{ sourceName: string; sourceUrl: string }>;
}

export interface Review {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  user: {
    id: string;
    username: string;
    profilePicture?: string | null;
  };
  movie?: Pick<MovieSummary, 'id' | 'slug' | 'title' | 'posterUrl'>;
}

export interface DiaryEntry {
  id: string;
  watchedAt: string;
  rating?: number | null;
  notes?: string | null;
  movie: Pick<MovieSummary, 'id' | 'slug' | 'title' | 'posterUrl' | 'releaseYear'>;
}

export interface UserList {
  id: string;
  title: string;
  description?: string | null;
  movieCount: number;
  updatedAt: string;
  isPublic?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string | null;
  profilePicture?: string | null;
  createdAt: string;
  _count?: {
    ratings: number;
    reviews: number;
    watchlist: number;
    diaryEntries: number;
    lists: number;
    followers: number;
    following: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
