export type LanguageCode = "am" | "en" | "om" | "ti";

export type MovieSummary = {
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
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};
