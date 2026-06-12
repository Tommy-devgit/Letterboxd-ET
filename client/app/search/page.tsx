import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { MovieCard } from '@/components/movie/movie-card';
import { PersonCard } from '@/components/person/person-card';
import { SectionHeader } from '@/components/common/section-header';
import { EmptyState } from '@/components/common/empty-state';
import { search } from '@/lib/api';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { q = '' } = await searchParams;

  const results = q
    ? await search(q).catch(() => ({ movies: [], people: [], total: 0 }))
    : { movies: [], people: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search input */}
      <form method="GET" action="/search" className="mb-10">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Search films, directors, people…"
            autoFocus
            className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-4 text-lg placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>
      </form>

      {!q && (
        <EmptyState
          icon={Search}
          title="Search Ethiopian cinema"
          description="Search by film title, director name, or genre."
        />
      )}

      {q && results.total === 0 && (
        <EmptyState
          icon={Search}
          title={`No results for "${q}"`}
          description="Try a different spelling or search in Amharic."
        />
      )}

      {results.movies.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Films"
            subtitle={`${results.movies.length} results`}
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {results.movies.map((m) => (
              <MovieCard key={m.id} movie={m} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {results.people.length > 0 && (
        <section>
          <SectionHeader
            title="People"
            subtitle={`${results.people.length} results`}
            className="mb-6"
          />
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {results.people.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
