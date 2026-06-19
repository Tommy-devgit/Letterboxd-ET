"use client";

import Link from "next/link";
import { Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistContent />
    </ProtectedRoute>
  );
}

function WatchlistContent() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useWatchlist(
    user?.id ?? null,
    page
  );

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon={<Heart className="h-10 w-10 opacity-40" />}
          title="Your watchlist is empty"
          description="Sign in to save films to your watchlist and never miss a great Ethiopian movie."
          action={
            <Button asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const movies = data?.data.map((e) => e.movie) ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent" />
          Watchlist
        </h1>
        {data && (
          <p className="text-foreground-muted text-sm mt-1">
            {data.total} film{data.total !== 1 ? "s" : ""} saved
          </p>
        )}
      </div>

      {isLoading && <MovieGridSkeleton />}
      {error && <ErrorState retry={() => refetch()} />}
      {!isLoading && movies.length === 0 && (
        <EmptyState
          title="Your watchlist is empty"
          description="Browse films and add them to your watchlist."
          action={
            <Button asChild variant="outline">
              <Link href="/explore">Explore Films</Link>
            </Button>
          }
        />
      )}
      {movies.length > 0 && (
        <>
          <MovieGrid movies={movies} />
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
