import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { RatingStars } from '@/components/movie/rating-stars';
import { GenreBadge } from '@/components/movie/genre-badge';
import { formatRuntime } from '@/lib/utils';
import type { MovieSummary } from '@/lib/types';

type HeroBannerProps = {
  movie: MovieSummary;
};

export function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-2xl lg:min-h-[600px]">
      {/* Backdrop */}
      {movie.backdropUrl ? (
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950 via-zinc-900 to-amber-950" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent" />

      {/* Content */}
      <div className="relative flex h-full min-h-[520px] flex-col justify-end p-6 sm:p-10 lg:min-h-[600px]">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Featured Film
          </p>

          <h1 className="mb-3 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="mb-3 text-lg text-muted-foreground">{movie.originalTitle}</p>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.runtimeMinutes && (
              <>
                <span className="text-border">·</span>
                <span>{formatRuntime(movie.runtimeMinutes)}</span>
              </>
            )}
            {movie.averageRating > 0 && (
              <>
                <span className="text-border">·</span>
                <RatingStars rating={movie.averageRating} size="sm" />
                <span>{movie.averageRating.toFixed(1)}</span>
              </>
            )}
          </div>

          {movie.genres.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {movie.genres.slice(0, 3).map((g) => (
                <GenreBadge key={g} genre={g} />
              ))}
            </div>
          )}

          {movie.synopsis && (
            <p className="mb-6 line-clamp-3 max-w-md text-sm leading-6 text-muted-foreground">
              {movie.synopsis}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/movies/${movie.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Film
            </Link>
            <Link
              href={`/movies/${movie.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface/80 px-6 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-surface"
            >
              <Play className="h-4 w-4" />
              Trailer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
