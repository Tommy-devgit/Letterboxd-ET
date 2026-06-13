export type LanguageCode = "am" | "en" | "om" | "ti";

export interface MovieSummary {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  synopsis: string | null;
  posterUrl: string | null;
  averageRating: number;
  reviewCount: number;
  genres: string[];
  directors: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type CreditRole =
  | "ACTOR"
  | "DIRECTOR"
  | "WRITER"
  | "PRODUCER"
  | "CINEMATOGRAPHER"
  | "EDITOR"
  | "COMPOSER";

export interface MovieCredit {
  role: CreditRole;
  characterName: string | null;
  person: {
    id: string;
    fullName: string;
    photoUrl: string | null;
  };
}

export interface MovieReview {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

export interface MovieDetail {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseDate: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  runtimeMinutes: number | null;
  averageRating: number;
  ratingsCount: number;
  genres: { genre: { id: string; name: string } }[];
  country: { name: string; code: string } | null;
  language: { name: string; code: string } | null;
  credits: MovieCredit[];
  ratings: { rating: number }[];
  reviews: MovieReview[];
  trailers: { id: string; title: string; youtubeUrl: string }[];
  sources: { sourceName: string; sourceUrl: string }[];
}

export interface DiaryEntry {
  id: string;
  watchedAt: string;
  rating: number | null;
  notes: string | null;
  movie: MovieSummary;
}

export interface WatchlistEntry {
  createdAt: string;
  movie: MovieSummary;
}

export interface ListItem {
  movie: MovieSummary;
  position: number;
}

export interface List {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  movies: ListItem[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
}

export interface MovieQueryParams {
  query?: string;
  genre?: string;
  language?: LanguageCode;
  page?: number;
  pageSize?: number;
}
