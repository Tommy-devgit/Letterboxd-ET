"use client";

import { useQuery } from "@tanstack/react-query";
import { moviesApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import type { MovieQueryParams } from "@/types";

export function useSearch(params: MovieQueryParams) {
  return useQuery({
    queryKey: keys.movies.list(params),
    queryFn: () => moviesApi.list(params),
    enabled: !!(params.query || params.genre || params.language),
    staleTime: 30 * 1000,
  });
}
