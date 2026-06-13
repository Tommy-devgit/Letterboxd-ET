"use client";

import { useQuery } from "@tanstack/react-query";
import { moviesApi, reviewsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";

export function useMovie(slug: string) {
  return useQuery({
    queryKey: keys.movies.detail(slug),
    queryFn: () => moviesApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useMovieReviews(movieId: string, page = 1) {
  return useQuery({
    queryKey: keys.movies.reviews(movieId, page),
    queryFn: () => reviewsApi.getByMovie(movieId, page),
    enabled: !!movieId,
  });
}
