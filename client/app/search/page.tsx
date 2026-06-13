"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useMovies } from "@/hooks/use-movies";
import { pluralize } from "@/lib/utils";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading, error, refetch } = useMovies(
    query ? { query, pageSize: 24 } : {}
  );

  const handleSearch = () => {
    if (input.trim()) setQuery(input.trim());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-3">Search Films</h1>
        <p className="text-foreground-muted text-sm mb-6">
          Find Ethiopian movies by title, director, or synopsis.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              className="pl-9 h-11 text-base"
              placeholder="Search…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
            />
          </div>
          <Button size="lg" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {query && (
        <>
          {isLoading && <MovieGridSkeleton count={12} />}
          {error && (
            <ErrorState retry={() => refetch()} />
          )}
          {data && data.data.length === 0 && (
            <EmptyState
              title={`No results for "${query}"`}
              description="Try a different search term."
            />
          )}
          {data && data.data.length > 0 && (
            <>
              <p className="text-sm text-text-muted mb-6">
                {pluralize(data.total, "result")} for &ldquo;{query}&rdquo;
              </p>
              <MovieGrid movies={data.data} />
            </>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-text-muted opacity-30 mx-auto mb-3" />
          <p className="text-foreground-muted text-sm">
            Start typing to search Ethiopian cinema
          </p>
        </div>
      )}
    </div>
  );
}
