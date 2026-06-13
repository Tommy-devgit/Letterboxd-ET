"use client";

import { useQuery } from "@tanstack/react-query";
import { moviesApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import type { MovieQueryParams } from "@/types";

export function useMovies(params: MovieQueryParams = {}) {
  return useQuery({
    queryKey: keys.movies.list(params),
    queryFn: () => moviesApi.list(params),
  });
}

export function useFeaturedMovies() {
  return useQuery({
    queryKey: keys.movies.featured(),
    queryFn: moviesApi.featured,
    staleTime: 5 * 60 * 1000,
  });
}
