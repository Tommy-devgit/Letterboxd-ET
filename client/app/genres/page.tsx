import type { Metadata } from 'next';
import Link from 'next/link';
import { getGenres, getMovies } from '@/lib/api';
import { SectionHeader } from '@/components/common/section-header';
import { MovieCard } from '@/components/movie/movie-card';

export const metadata: Metadata = { title: 'Genres' };

const GENRE_DESCRIPTIONS: Record<string, string> = {
  Drama: 'Emotional stories of human experience',
  Comedy: 'Light-hearted and comedic stories',
  Romance: 'Stories of love and relationships',
  Action: 'High-energy sequences and adventure',
  Documentary: 'Non-fiction exploration of real events',
  Historical: 'Stories rooted in Ethiopian history',
  Thriller: 'Suspense and tension-driven narratives',
  Social: 'Films exploring society and culture',
  Horror: 'Fear and the unknown',
};

export default async function GenresPage() {
  const genres = await getGenres().catch(() => []);

  // Fetch a sample movie for each genre
  const genreWithMovies = await Promise.all(
    genres.map(async (genre) => {
      const result = await getMovies({ genre: genre.name, limit: 4, sortBy: 'averageRating', order: 'desc' }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        limit: 4,
      }));
      return { genre, movies: result.data, total: result.total };
    }),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        title="Browse by Genre"
        subtitle="Ethiopian Cinema"
        className="mb-10"
      />

      {/* Genre quick-select pills */}
      <div className="mb-10 flex flex-wrap gap-2">
        {genres.map((g) => (
          <a
            key={g.id}
            href={`#genre-${g.id}`}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {g.name}
          </a>
        ))}
      </div>

      {/* Genre sections */}
      <div className="flex flex-col gap-14">
        {genreWithMovies.map(({ genre, movies, total }) => (
          <section key={genre.id} id={`genre-${genre.id}`}>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {total} films
                </p>
                <h2 className="text-2xl font-black">{genre.name}</h2>
                {GENRE_DESCRIPTIONS[genre.name] && (
                  <p className="text-sm text-muted-foreground">
                    {GENRE_DESCRIPTIONS[genre.name]}
                  </p>
                )}
              </div>
              <Link
                href={`/movies?genre=${encodeURIComponent(genre.name)}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                See all →
              </Link>
            </div>
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {movies.map((m) => (
                  <MovieCard key={m.id} movie={m} variant="compact" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No films yet in this genre.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
