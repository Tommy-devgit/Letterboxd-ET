import type { MovieQueryParams } from "@/types";

export const keys = {
  movies: {
    all: ["movies"] as const,
    lists: () => [...keys.movies.all, "list"] as const,
    list: (params: MovieQueryParams) =>
      [...keys.movies.lists(), params] as const,
    featured: () => [...keys.movies.all, "featured"] as const,
    detail: (slug: string) => [...keys.movies.all, "detail", slug] as const,
    reviews: (movieId: string, page: number) =>
      [...keys.movies.all, "reviews", movieId, page] as const,
  },
  watchlist: {
    all: ["watchlist"] as const,
    list: (userId: string, page: number) =>
      [...keys.watchlist.all, userId, page] as const,
  },
  diary: {
    all: ["diary"] as const,
    list: (userId: string, page: number) =>
      [...keys.diary.all, userId, page] as const,
  },
  lists: {
    all: ["lists"] as const,
    public: (page: number) => [...keys.lists.all, "public", page] as const,
    byUser: (userId: string) =>
      [...keys.lists.all, "user", userId] as const,
    detail: (id: string) => [...keys.lists.all, "detail", id] as const,
  },
  ratings: {
    mine: (movieId: string, userId: string) =>
      ["ratings", "mine", movieId, userId] as const,
  },
  reviews: {
    recent: (page: number) => ["reviews", "recent", page] as const,
  },
  users: {
    list: (page: number) => ["users", "list", page] as const,
  },
  activity: {
    recent: (limit: number) => ["activity", "recent", limit] as const,
  },
} as const;
