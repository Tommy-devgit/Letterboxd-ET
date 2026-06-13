import axios from "axios";
import type {
  MovieSummary,
  MovieDetail,
  PaginatedResponse,
  MovieQueryParams,
  MovieReview,
  DiaryEntry,
  WatchlistEntry,
  List,
} from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const moviesApi = {
  list: (params: MovieQueryParams = {}) =>
    api
      .get<PaginatedResponse<MovieSummary>>("/movies", { params })
      .then((r) => r.data),

  featured: () =>
    api.get<MovieSummary[]>("/movies/featured").then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<MovieDetail>(`/movies/${slug}`).then((r) => r.data),
};

export const reviewsApi = {
  getByMovie: (movieId: string, page = 1, pageSize = 20) =>
    api
      .get<PaginatedResponse<MovieReview>>(`/movies/${movieId}/reviews`, {
        params: { page, pageSize },
      })
      .then((r) => r.data),

  create: (dto: { userId: string; movieId: string; content: string }) =>
    api.post<MovieReview>("/reviews", dto).then((r) => r.data),

  like: (reviewId: string, userId: string) =>
    api.post(`/reviews/${reviewId}/likes`, { userId }).then((r) => r.data),

  unlike: (reviewId: string, userId: string) =>
    api
      .delete(`/reviews/${reviewId}/likes`, { data: { userId } })
      .then((r) => r.data),
};

export const watchlistApi = {
  get: (userId: string, page = 1, pageSize = 20) =>
    api
      .get<PaginatedResponse<WatchlistEntry>>("/watchlist", {
        params: { userId, page, pageSize },
      })
      .then((r) => r.data),

  add: (userId: string, movieId: string) =>
    api.post("/watchlist", { userId, movieId }).then((r) => r.data),

  remove: (userId: string, movieId: string) =>
    api
      .delete(`/watchlist/${movieId}`, { params: { userId } })
      .then((r) => r.data),
};

export const diaryApi = {
  get: (userId: string, page = 1, pageSize = 20) =>
    api
      .get<PaginatedResponse<DiaryEntry>>("/diary", {
        params: { userId, page, pageSize },
      })
      .then((r) => r.data),

  add: (dto: {
    userId: string;
    movieId: string;
    watchedAt: string;
    rating?: number;
    notes?: string;
  }) => api.post("/diary", dto).then((r) => r.data),
};

export const listsApi = {
  getUserLists: (userId: string) =>
    api.get<List[]>("/lists", { params: { userId } }).then((r) => r.data),

  getList: (id: string) => api.get<List>(`/lists/${id}`).then((r) => r.data),

  create: (dto: {
    userId: string;
    title: string;
    description?: string;
  }) => api.post<List>("/lists", dto).then((r) => r.data),

  addMovie: (listId: string, dto: { movieId: string; position: number }) =>
    api.post(`/lists/${listId}/movies`, dto).then((r) => r.data),

  removeMovie: (listId: string, movieId: string) =>
    api.delete(`/lists/${listId}/movies/${movieId}`).then((r) => r.data),
};

export const ratingsApi = {
  rate: (movieId: string, dto: { userId: string; rating: number }) =>
    api.post(`/movies/${movieId}/ratings`, dto).then((r) => r.data),

  getMyRating: (movieId: string, userId: string) =>
    api
      .get<{ rating: number }>(`/movies/${movieId}/ratings/me`, {
        params: { userId },
      })
      .then((r) => r.data),
};
