import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Plus, Heart, BookOpen, Star, Clock, Calendar, Globe } from 'lucide-react';
import { RatingStars } from '@/components/movie/rating-stars';
import { GenreBadge } from '@/components/movie/genre-badge';
import { MoviePoster } from '@/components/movie/movie-poster';
import { PersonCard } from '@/components/person/person-card';
import { SectionHeader } from '@/components/common/section-header';
import { Badge } from '@/components/ui/badge';
import { getMovieBySlug, getMovieReviews } from '@/lib/api';
import { formatRuntime } from '@/lib/utils';
import type { MovieCredit } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const movie = await getMovieBySlug(slug);
    return {
      title: movie.title,
      description: movie.synopsis ?? undefined,
      openGraph: { images: movie.posterUrl ? [movie.posterUrl] : [] },
    };
  } catch {
    return { title: 'Film not found' };
  }
}

function groupCredits(credits: MovieCredit[]) {
  const groups: Record<string, MovieCredit[]> = {};
  for (const c of credits) {
    if (!groups[c.role]) groups[c.role] = [];
    groups[c.role].push(c);
  }
  return groups;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let movie;
  try {
    movie = await getMovieBySlug(slug);
  } catch {
    notFound();
  }

  const reviews = await getMovieReviews(slug, 1, 5).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 5,
  }));

  const creditGroups = groupCredits(movie.credits ?? []);
  const directors = creditGroups['DIRECTOR'] ?? [];
  const actors = creditGroups['ACTOR'] ?? [];
  const writers = creditGroups['WRITER'] ?? [];
  const producers = creditGroups['PRODUCER'] ?? [];

  const ytTrailer = movie.trailers?.find((t) =>
    t.youtubeUrl.includes('youtube.com') || t.youtubeUrl.includes('youtu.be'),
  );

  const ytId = ytTrailer
    ? ytTrailer.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1]
    : null;

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-emerald-950 via-zinc-900 to-amber-950" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: poster + meta */}
        <div className="-mt-24 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Poster */}
          <div className="w-36 shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-2xl sm:w-48">
            <MoviePoster
              posterUrl={movie.posterUrl}
              title={movie.title}
              width={192}
              height={288}
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 pb-1">
            <div className="mb-2 flex flex-wrap gap-2">
              {movie.genres?.map((g) => <GenreBadge key={g} genre={g} />)}
            </div>
            <h1 className="mb-1 text-3xl font-black sm:text-4xl">{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="mb-3 text-lg text-muted-foreground">{movie.originalTitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {movie.releaseYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.releaseYear}
                </span>
              )}
              {movie.runtimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatRuntime(movie.runtimeMinutes)}
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {movie.language.name}
                </span>
              )}
              {directors.length > 0 && (
                <span>
                  Directed by{' '}
                  <span className="font-medium text-foreground">
                    {directors.map((d) => d.person.fullName).join(', ')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="flex flex-col gap-10">
            {/* Rating + actions */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1">
                <RatingStars rating={movie.averageRating} size="lg" />
                <p className="text-sm text-muted-foreground">
                  {movie.averageRating.toFixed(1)} · {movie.ratingsCount} ratings
                </p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-muted">
                  <Star className="h-4 w-4" />
                  Rate
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-muted">
                  <Plus className="h-4 w-4" />
                  Watchlist
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-muted">
                  <Heart className="h-4 w-4" />
                  Favorite
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-muted">
                  <BookOpen className="h-4 w-4" />
                  Log
                </button>
              </div>
            </div>

            {/* Synopsis */}
            {movie.synopsis && (
              <div>
                <h2 className="mb-3 text-lg font-bold">Synopsis</h2>
                <p className="leading-7 text-muted-foreground">{movie.synopsis}</p>
              </div>
            )}

            {/* Trailer */}
            {ytId && (
              <div>
                <h2 className="mb-3 text-lg font-bold">Trailer</h2>
                <div className="aspect-video overflow-hidden rounded-xl border border-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {/* Cast */}
            {actors.length > 0 && (
              <div>
                <SectionHeader title="Cast" className="mb-4" />
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {actors.slice(0, 12).map((c) => (
                    <PersonCard
                      key={c.id}
                      person={{
                        ...c.person,
                        role: c.characterName ?? 'ACTOR',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Directors */}
            {directors.length > 0 && (
              <div>
                <SectionHeader title="Direction" className="mb-4" />
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {directors.map((c) => (
                    <PersonCard
                      key={c.id}
                      person={{ ...c.person, role: 'DIRECTOR' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <SectionHeader
                title="Reviews"
                href={`/movies/${slug}/reviews`}
                className="mb-4"
              />
              {reviews.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet.{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Be the first to review.
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.data.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-xl border border-border bg-surface p-5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-sm">{r.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground line-clamp-4">
                        {r.content}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Details */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Details
              </h3>
              <dl className="flex flex-col gap-3 text-sm">
                {movie.releaseYear && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Year</dt>
                    <dd>{movie.releaseYear}</dd>
                  </div>
                )}
                {movie.runtimeMinutes && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Runtime</dt>
                    <dd>{formatRuntime(movie.runtimeMinutes)}</dd>
                  </div>
                )}
                {movie.country && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Country</dt>
                    <dd>{movie.country.name}</dd>
                  </div>
                )}
                {movie.language && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Language</dt>
                    <dd>{movie.language.name}</dd>
                  </div>
                )}
                {directors.length > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Director</dt>
                    <dd className="text-right">{directors.map((d) => d.person.fullName).join(', ')}</dd>
                  </div>
                )}
                {writers.length > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground shrink-0">Writers</dt>
                    <dd className="text-right">{writers.map((w) => w.person.fullName).join(', ')}</dd>
                  </div>
                )}
                {movie.imdbId && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">IMDb</dt>
                    <dd>
                      <a
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {movie.imdbId}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* External sources */}
            {movie.sources && movie.sources.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Watch On
                </h3>
                <div className="flex flex-col gap-2">
                  {movie.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Badge variant="primary">{src.sourceName}</Badge>
                      <span className="truncate text-muted-foreground">View on {src.sourceName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
