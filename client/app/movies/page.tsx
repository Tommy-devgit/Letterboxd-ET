import type { Metadata } from 'next';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { SectionHeader } from '@/components/common/section-header';
import { MovieCard } from '@/components/movie/movie-card';
import { EmptyState } from '@/components/common/empty-state';
import { getMovies, getGenres } from '@/lib/api';
import type { MoviesQuery } from '@/lib/api';

export const metadata: Metadata = { title: 'Films' };

const SORT_OPTIONS = [
  { value: 'releaseDate:desc', label: 'Newest first' },
  { value: 'releaseDate:asc', label: 'Oldest first' },
  { value: 'averageRating:desc', label: 'Top rated' },
  { value: 'ratingsCount:desc', label: 'Most popular' },
  { value: 'title:asc', label: 'A–Z' },
];

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const genre = params.genre ?? '';
  const [sortBy, order] = (params.sort ?? 'releaseDate:desc').split(':') as [string, 'asc' | 'desc'];

  const query: MoviesQuery = {
    page,
    limit: 24,
    ...(genre ? { genre } : {}),
    sortBy: sortBy as MoviesQuery['sortBy'],
    order,
  };

  const [result, genres] = await Promise.all([
    getMovies(query).catch(() => ({ data: [], total: 0, page: 1, limit: 24 })),
    getGenres().catch(() => []),
  ]);

  const totalPages = Math.ceil(result.total / result.limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        title={genre ? `${genre} Films` : 'All Films'}
        subtitle={`${result.total} films in catalog`}
        className="mb-8"
      />

      {/* Filters row */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {/* Genre filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/movies"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !genre
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
            }`}
          >
            All
          </Link>
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/movies?genre=${encodeURIComponent(g.name)}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                genre === g.name
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/movies?${genre ? `genre=${encodeURIComponent(genre)}&` : ''}sort=${opt.value}`}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  `${sortBy}:${order}` === opt.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {result.data.length === 0 ? (
        <EmptyState
          title="No films found"
          description={genre ? `No ${genre} films in the catalog yet.` : 'The catalog is empty.'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {result.data.map((movie) => (
            <MovieCard key={movie.id} movie={movie} variant="compact" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/movies?page=${page - 1}${genre ? `&genre=${encodeURIComponent(genre)}` : ''}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/movies?page=${page + 1}${genre ? `&genre=${encodeURIComponent(genre)}` : ''}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
