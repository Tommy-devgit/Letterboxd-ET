"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useMovies } from "@/hooks/use-movies";
import { pluralize } from "@/lib/utils";
import type { LanguageCode } from "@/types";

const GENRES = [
  "Drama", "Comedy", "Action", "Romance", "Thriller",
  "Horror", "Documentary", "History", "Family", "Animation",
];

const LANGUAGES: { value: LanguageCode; label: string }[] = [
  { value: "am", label: "Amharic" },
  { value: "om", label: "Oromo" },
  { value: "ti", label: "Tigrinya" },
  { value: "en", label: "English" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "");
  const [language, setLanguage] = useState<LanguageCode | "">(
    (searchParams.get("lang") as LanguageCode) ?? ""
  );
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [activeQuery, setActiveQuery] = useState(query);
  const [activeGenre, setActiveGenre] = useState(genre);
  const [activeLang, setActiveLang] = useState<LanguageCode | "">(language);

  const { data, isLoading, error, refetch } = useMovies({
    query: activeQuery || undefined,
    genre: activeGenre || undefined,
    language: (activeLang as LanguageCode) || undefined,
    page,
    pageSize: 24,
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const handleSearch = useCallback(() => {
    setActiveQuery(query);
    setActiveGenre(genre);
    setActiveLang(language);
    setPage(1);
  }, [query, genre, language]);

  const clearFilters = () => {
    setQuery("");
    setGenre("");
    setLanguage("");
    setActiveQuery("");
    setActiveGenre("");
    setActiveLang("");
    setPage(1);
  };

  const hasFilters = activeQuery || activeGenre || activeLang;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Explore Films</h1>
        <p className="text-foreground-muted text-sm">
          Browse Ethiopian cinema by title, genre, or language.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            className="pl-9"
            placeholder="Search movies, directors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-accent text-accent" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 rounded-lg border border-border bg-surface">
          <div className="w-full sm:w-48">
            <Select
              value={genre}
              onValueChange={setGenre}
            >
              <SelectTrigger>
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All genres</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={language}
              onValueChange={(v: string) => setLanguage(v as LanguageCode | "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All languages</SelectItem>
                {LANGUAGES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-text-muted">Filters:</span>
          {activeQuery && (
            <Badge variant="accent">&quot;{activeQuery}&quot;</Badge>
          )}
          {activeGenre && (
            <Badge variant="accent">{activeGenre}</Badge>
          )}
          {activeLang && (
            <Badge variant="accent">
              {LANGUAGES.find((l) => l.value === activeLang)?.label}
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}

      {/* Results count */}
      {data && (
        <p className="text-sm text-text-muted mb-6">
          {pluralize(data.total, "film")} found
        </p>
      )}

      {/* Grid */}
      {isLoading && <MovieGridSkeleton count={24} />}
      {error && (
        <ErrorState
          description="Could not load films. Is the server running?"
          retry={() => refetch()}
        />
      )}
      {data && data.data.length === 0 && (
        <EmptyState
          title="No films found"
          description="Try adjusting your search or filters."
        />
      )}
      {data && data.data.length > 0 && (
        <>
          <MovieGrid movies={data.data} />
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

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="lb-container py-8"><MovieGridSkeleton count={12} /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
