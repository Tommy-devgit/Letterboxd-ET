import { MovieCard } from './movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MovieSummary } from '@/lib/types';

type MovieGridProps = {
  movies: MovieSummary[];
  variant?: 'default' | 'compact';
  columns?: 2 | 3 | 4 | 5 | 6;
};

const colClasses = {
  2: 'grid-cols-2 sm:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
};

export function MovieGrid({ movies, variant = 'default', columns = 4 }: MovieGridProps) {
  return (
    <div className={`grid gap-4 ${colClasses[columns]}`}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} variant={variant} />
      ))}
    </div>
  );
}

export function MovieGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div className={`grid gap-4 ${colClasses[columns]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
