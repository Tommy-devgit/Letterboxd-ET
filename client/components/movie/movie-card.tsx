import Link from 'next/link';
import { MoviePoster } from './movie-poster';
import { RatingStars } from './rating-stars';
import { GenreBadge } from './genre-badge';
import { cn } from '@/lib/utils';
import type { MovieSummary } from '@/lib/types';

type MovieCardProps = {
  movie: MovieSummary;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
};

export function MovieCard({ movie, variant = 'default', className }: MovieCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/movies/${movie.slug}`} className={cn('group block', className)}>
        <div className="overflow-hidden rounded-md transition-transform group-hover:scale-[1.02]">
          <MoviePoster
            posterUrl={movie.posterUrl}
            title={movie.title}
            className="w-full rounded-md"
          />
        </div>
        <div className="mt-2 px-0.5">
          <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <p className="text-xs text-muted-foreground">{movie.releaseYear ?? '—'}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/movies/${movie.slug}`}
        className={cn(
          'group flex gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border/80 hover:bg-muted/30',
          className,
        )}
      >
        <div className="w-16 shrink-0 overflow-hidden rounded">
          <MoviePoster posterUrl={movie.posterUrl} title={movie.title} width={64} height={96} />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1">
          <p className="truncate font-semibold group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {movie.directors?.slice(0, 1).join(', ')} · {movie.releaseYear ?? '—'}
          </p>
          {movie.averageRating > 0 && (
            <RatingStars rating={movie.averageRating} size="sm" />
          )}
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/movies/${movie.slug}`} className={cn('group block', className)}>
      <article className="grid h-full gap-3 overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="overflow-hidden">
          <MoviePoster
            posterUrl={movie.posterUrl}
            title={movie.title}
            className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col gap-2 px-3 pb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {movie.releaseYear ?? '—'}
              {movie.directors?.length ? ` · ${movie.directors[0]}` : ''}
            </p>
            <h3 className="font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {movie.title}
            </h3>
          </div>
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((g) => (
                <GenreBadge key={g} genre={g} linkable={false} />
              ))}
            </div>
          )}
          {movie.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars rating={movie.averageRating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {movie.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
