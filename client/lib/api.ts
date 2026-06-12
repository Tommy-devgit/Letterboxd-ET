import type {
  DiaryEntry,
  Genre,
  MovieDetail,
  MovieSummary,
  PaginatedResponse,
  Person,
  Review,
  UserList,
  UserProfile,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Base fetch ──────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { revalidate?: number; tags?: string[] },
): Promise<T> {
  const { revalidate = 60, tags, ...init } = options ?? {};
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...((init.headers as object) ?? {}) },
    next: { revalidate, ...(tags ? { tags } : {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Movies ──────────────────────────────────────────────────────────────────

export interface MoviesQuery {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  language?: string;
  sortBy?: 'title' | 'releaseDate' | 'averageRating' | 'ratingsCount';
  order?: 'asc' | 'desc';
  search?: string;
}

export async function getMovies(query: MoviesQuery = {}): Promise<PaginatedResponse<MovieSummary>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return apiFetch<PaginatedResponse<MovieSummary>>(`/movies${qs ? `?${qs}` : ''}`, {
    revalidate: 120,
  });
}

export async function getFeaturedMovies(): Promise<MovieSummary[]> {
  try {
    return await apiFetch<MovieSummary[]>('/movies/featured', { revalidate: 300 });
  } catch {
    return FALLBACK_MOVIES;
  }
}

export async function getMovieBySlug(slug: string): Promise<MovieDetail> {
  return apiFetch<MovieDetail>(`/movies/${slug}`, {
    revalidate: 300,
    tags: [`movie:${slug}`],
  });
}

export async function getMovieReviews(
  slug: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Review>> {
  return apiFetch<PaginatedResponse<Review>>(
    `/movies/${slug}/reviews?page=${page}&limit=${limit}`,
    { revalidate: 60 },
  );
}

// ─── People ──────────────────────────────────────────────────────────────────

export async function getPeople(page = 1, limit = 24): Promise<PaginatedResponse<Person>> {
  return apiFetch<PaginatedResponse<Person>>(`/people?page=${page}&limit=${limit}`, {
    revalidate: 300,
  });
}

export async function getPersonBySlug(slug: string): Promise<Person & {
  credits: Array<{ role: string; movie: MovieSummary }>;
}> {
  return apiFetch(`/people/${slug}`, { revalidate: 300 });
}

// ─── Genres ──────────────────────────────────────────────────────────────────

export async function getGenres(): Promise<Genre[]> {
  return apiFetch<Genre[]>('/genres', { revalidate: 3600 });
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResults {
  movies: MovieSummary[];
  people: Person[];
  total: number;
}

export async function search(q: string): Promise<SearchResults> {
  if (!q.trim()) return { movies: [], people: [], total: 0 };
  return apiFetch<SearchResults>(`/search?q=${encodeURIComponent(q)}`, { revalidate: 30 });
}

// ─── User – client-side (no cache) ───────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${userId}`, { cache: 'no-store' });
}

export async function getUserWatchlist(
  userId: string,
  page = 1,
): Promise<PaginatedResponse<MovieSummary>> {
  return apiFetch<PaginatedResponse<MovieSummary>>(
    `/watchlist?userId=${userId}&page=${page}`,
    { cache: 'no-store' },
  );
}

export async function getUserDiary(
  userId: string,
  page = 1,
): Promise<PaginatedResponse<DiaryEntry>> {
  return apiFetch<PaginatedResponse<DiaryEntry>>(
    `/diary?userId=${userId}&page=${page}`,
    { cache: 'no-store' },
  );
}

export async function getUserLists(userId: string): Promise<UserList[]> {
  return apiFetch<UserList[]>(`/lists?userId=${userId}`, { cache: 'no-store' });
}

export async function getUserReviews(
  userId: string,
  page = 1,
): Promise<PaginatedResponse<Review>> {
  return apiFetch<PaginatedResponse<Review>>(
    `/reviews?userId=${userId}&page=${page}`,
    { cache: 'no-store' },
  );
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function addToWatchlist(userId: string, movieId: string) {
  return apiFetch('/watchlist/add', {
    method: 'POST',
    body: JSON.stringify({ userId, movieId }),
    cache: 'no-store',
  });
}

export async function removeFromWatchlist(userId: string, movieId: string) {
  return apiFetch('/watchlist/remove', {
    method: 'DELETE',
    body: JSON.stringify({ userId, movieId }),
    cache: 'no-store',
  });
}

export async function rateMovie(userId: string, movieId: string, rating: number) {
  return apiFetch('/ratings/rate', {
    method: 'POST',
    body: JSON.stringify({ userId, movieId, rating }),
    cache: 'no-store',
  });
}

export async function createReview(userId: string, movieId: string, content: string) {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ userId, movieId, content }),
    cache: 'no-store',
  });
}

export async function addDiaryEntry(
  userId: string,
  movieId: string,
  watchedAt: string,
  rating?: number,
  notes?: string,
) {
  return apiFetch('/diary', {
    method: 'POST',
    body: JSON.stringify({ userId, movieId, watchedAt, rating, notes }),
    cache: 'no-store',
  });
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_MOVIES: MovieSummary[] = [
  {
    id: 'difret',
    slug: 'difret',
    title: 'Difret',
    releaseYear: 2014,
    synopsis: 'A landmark legal drama and essential entry point into contemporary Ethiopian cinema.',
    posterUrl: null,
    averageRating: 4.4,
    ratingsCount: 138,
    genres: ['Drama'],
    directors: ['Zeresenay Berhane Mehari'],
  },
  {
    id: 'teza',
    slug: 'teza',
    title: 'Teza',
    releaseYear: 2008,
    synopsis: 'A sweeping story of exile, memory, politics, and returning home.',
    posterUrl: null,
    averageRating: 4.5,
    ratingsCount: 96,
    genres: ['Drama', 'History'],
    directors: ['Haile Gerima'],
  },
  {
    id: 'lamb',
    slug: 'lamb',
    title: 'Lamb',
    releaseYear: 2015,
    synopsis: 'A tender rural coming-of-age film about grief, belonging, and a beloved lamb.',
    posterUrl: null,
    averageRating: 4.1,
    ratingsCount: 81,
    genres: ['Drama'],
    directors: ['Yared Zeleke'],
  },
  {
    id: 'faya-dayi',
    slug: 'faya-dayi',
    title: 'Faya Dayi',
    releaseYear: 2021,
    synopsis: 'An immersive documentary about khat farmers in the Ethiopian highlands.',
    posterUrl: null,
    averageRating: 4.3,
    ratingsCount: 64,
    genres: ['Documentary'],
    directors: ['Jessica Beshir'],
  },
];
