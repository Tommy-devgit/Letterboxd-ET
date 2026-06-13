"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { watchlistApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";

export function useWatchlist(userId: string | null, page = 1) {
  return useQuery({
    queryKey: keys.watchlist.list(userId ?? "", page),
    queryFn: () => watchlistApi.get(userId!, page),
    enabled: !!userId,
  });
}

export function useWatchlistMutations(userId: string | null) {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (movieId: string) => watchlistApi.add(userId!, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.watchlist.all });
    },
  });

  const remove = useMutation({
    mutationFn: (movieId: string) => watchlistApi.remove(userId!, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.watchlist.all });
    },
  });

  return { add, remove };
}
