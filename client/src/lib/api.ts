import axios from "axios";
import type {
  ActivityItem,
  DiaryEntry,
  List,
  MovieDetail,
  MovieQueryParams,
  MovieReview,
  MovieSummary,
  PaginatedResponse,
  PersonSummary,
  User,
  UserProfile,
  WatchlistEntry,
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
    api.get<PaginatedResponse<MovieSummary>>("/movies", { params }).then((r) => r.data),
  featured: () => api.get<MovieSummary[]>("/movies/featured").then((r) => r.data),
  getBySlug: (slug: string) => api.get<MovieDetail>(`/movies/${slug}`).then((r) => r.data),
};

export const reviewsApi = {
  recent: (page = 1, pageSize = 24) =>
    api.get<PaginatedResponse<MovieReview>>("/reviews", { params: { page, pageSize } }).then((r) => r.data),
  getByMovie: (movieId: string, page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<MovieReview>>(`/movies/${movieId}/reviews`, { params: { page, pageSize } }).then((r) => r.data),
  create: (dto: { userId?: string; movieId: string; content: string }) =>
    api.post<MovieReview>("/reviews", dto).then((r) => r.data),
  update: (reviewId: string, dto: { userId?: string; content: string }) =>
    api.patch<MovieReview>(`/reviews/${reviewId}`, dto).then((r) => r.data),
  delete: (reviewId: string, userId?: string) =>
    api.delete<{ success: true }>(`/reviews/${reviewId}`, { data: userId ? { userId } : undefined }).then((r) => r.data),
  like: (reviewId: string, userId?: string) =>
    api.post(`/reviews/${reviewId}/likes`, userId ? { userId } : undefined).then((r) => r.data),
  unlike: (reviewId: string, userId?: string) =>
    api.delete(`/reviews/${reviewId}/likes`, { data: userId ? { userId } : undefined }).then((r) => r.data),
};

export const watchlistApi = {
  get: (userId: string, page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<WatchlistEntry>>("/watchlist", { params: { userId, page, pageSize } }).then((r) => r.data),
  add: (movieId: string, userId?: string) =>
    api.post("/watchlist", { movieId, userId }).then((r) => r.data),
  remove: (movieId: string, userId?: string) =>
    api.delete(`/watchlist/${movieId}`, { params: userId ? { userId } : undefined }).then((r) => r.data),
};

export const diaryApi = {
  get: (userId: string, page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<DiaryEntry>>("/diary", { params: { userId, page, pageSize } }).then((r) => r.data),
  add: (dto: { userId?: string; movieId: string; watchedAt: string; rating?: number; notes?: string }) =>
    api.post("/diary", dto).then((r) => r.data),
};

export const listsApi = {
  getPublicLists: (page = 1, pageSize = 24) =>
    api.get<PaginatedResponse<List>>("/lists", { params: { page, pageSize } }).then((r) => r.data),
  getUserLists: (userId: string) =>
    api.get<List[]>("/lists", { params: { userId } }).then((r) => r.data),
  getList: (id: string) => api.get<List>(`/lists/${id}`).then((r) => r.data),
  create: (dto: { userId?: string; title: string; description?: string }) =>
    api.post<List>("/lists", dto).then((r) => r.data),
  update: (id: string, dto: { title?: string; description?: string }) =>
    api.patch<List>(`/lists/${id}`, dto).then((r) => r.data),
  delete: (id: string) =>
    api.delete<{ success: true }>(`/lists/${id}`).then((r) => r.data),
  addMovie: (listId: string, dto: { movieId: string; position: number }) =>
    api.post(`/lists/${listId}/movies`, dto).then((r) => r.data),
  removeMovie: (listId: string, movieId: string) =>
    api.delete(`/lists/${listId}/movies/${movieId}`).then((r) => r.data),
};

export const usersApi = {
  list: (page = 1, pageSize = 24) =>
    api.get<PaginatedResponse<User>>("/users", { params: { page, pageSize } }).then((r) => r.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  getByUsername: (username: string) =>
    api.get<UserProfile>(`/users/username/${username}`).then((r) => r.data),
  updateProfile: (id: string, dto: { bio?: string; profilePicture?: string }) =>
    api.patch<User>(`/users/${id}/profile`, dto).then((r) => r.data),
  updateAccount: (id: string, dto: { username?: string; email?: string }) =>
    api.patch<User>(`/users/${id}/account`, dto).then((r) => r.data),
  changePassword: (id: string, dto: { currentPassword: string; newPassword: string }) =>
    api.patch<{ success: true }>(`/users/${id}/password`, dto).then((r) => r.data),
};

export const activityApi = {
  recent: (limit = 30) =>
    api.get<ActivityItem[]>("/activity", { params: { limit } }).then((r) => r.data),
};

export const peopleApi = {
  popular: (role?: "ACTOR" | "DIRECTOR", take = 12) =>
    api.get<PersonSummary[]>("/people/popular", { params: { role, take } }).then((r) => r.data),
};

export const authApi = {
  login: (dto: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string; expiresIn: number }>("/auth/login", dto).then((r) => r.data),
  register: (dto: { username: string; email: string; password: string }) =>
    api.post<{ user: User; accessToken: string; expiresIn: number }>("/auth/register", dto).then((r) => r.data),
  refresh: () =>
    api.post<{ user: User; accessToken: string; expiresIn: number }>("/auth/refresh").then((r) => r.data),
  logout: () => api.post<{ success: true }>("/auth/logout").then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
  forgotPassword: (dto: { email: string }) =>
    api.post("/auth/forgot-password", dto).then((r) => r.data),
  changePassword: (dto: { currentPassword: string; newPassword: string }) =>
    api.patch<{ success: true; message: string }>("/auth/change-password", dto).then((r) => r.data),
};

export const ratingsApi = {
  rate: (movieId: string, dto: { userId?: string; rating: number }) =>
    api.post(`/movies/${movieId}/ratings`, dto).then((r) => r.data),
  getMyRating: (movieId: string, userId?: string) =>
    api.get<{ rating: number }>(`/movies/${movieId}/ratings/me`, { params: userId ? { userId } : undefined }).then((r) => r.data),
};
