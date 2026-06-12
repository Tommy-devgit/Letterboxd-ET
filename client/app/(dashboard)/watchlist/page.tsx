import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Film } from 'lucide-react';
import { SectionHeader } from '@/components/common/section-header';
import { EmptyState } from '@/components/common/empty-state';
import { MovieCard } from '@/components/movie/movie-card';
import { getUserWatchlist } from '@/lib/api';

export const metadata: Metadata = { title: 'Watchlist' };

// TODO: Replace with authenticated userId from session
const DEMO_USER_ID = 'demo';

export default async function WatchlistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? 1);

  const result = await getUserWatchlist(DEMO_USER_ID, page).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 24,
  }));

  const totalPages = Math.ceil(result.total / (result.limit || 24));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <SectionHeader
          title="Watchlist"
          subtitle={result.total > 0 ? `${result.total} films` : undefined}
        />
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Your watchlist is empty"
          description="Add films you want to watch from any movie page."
          action={
            <Link
              href="/movies"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Film className="h-4 w-4" />
              Browse films
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {result.data.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="compact" />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/watchlist?page=${page - 1}`}
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
                  href={`/watchlist?page=${page + 1}`}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
