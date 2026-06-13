"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  Clock,
  Calendar,
  Globe,
  ExternalLink,
  Play,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MoviePoster } from "@/components/movie/movie-poster";
import { GenreBadge } from "@/components/movie/genre-badge";
import { ReviewCard } from "@/components/review/review-card";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useMovie, useMovieReviews } from "@/hooks/use-movie";
import { formatRuntime, formatDateShort, formatRating } from "@/lib/utils";
import type { CreditRole } from "@/types";

const ROLE_LABELS: Record<CreditRole, string> = {
  DIRECTOR: "Director",
  ACTOR: "Cast",
  WRITER: "Writer",
  PRODUCER: "Producer",
  CINEMATOGRAPHER: "Cinematography",
  EDITOR: "Editor",
  COMPOSER: "Music",
};

function MovieDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-56 aspect-[2/3] rounded-xl shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4 rounded" />
          <Skeleton className="h-5 w-1/2 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function MoviePage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: movie, isLoading, error, refetch } = useMovie(slug);
  const { data: reviewsData } = useMovieReviews(movie?.id ?? "", 1);
  const [inWatchlist, setInWatchlist] = useState(false);

  if (isLoading) return <MovieDetailSkeleton />;
  if (error || !movie)
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ErrorState
          title="Movie not found"
          description="This film could not be found."
          retry={() => refetch()}
        />
      </div>
    );

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const directors = movie.credits.filter((c) => c.role === "DIRECTOR");
  const cast = movie.credits.filter((c) => c.role === "ACTOR").slice(0, 8);
  const crew = movie.credits.filter(
    (c) => c.role !== "ACTOR" && c.role !== "DIRECTOR"
  );

  const genres = movie.genres.map((g) => g.genre);
  const reviews = reviewsData?.data ?? movie.reviews;

  const averageRating =
    movie.ratings.length
      ? movie.ratings.reduce((s, r) => s + r.rating, 0) / movie.ratings.length
      : movie.averageRating;

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <MoviePoster
          src={movie.backdropUrl ?? movie.posterUrl}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-40 sm:w-48 md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-2 ring-border shadow-2xl shadow-black/50">
              <MoviePoster
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 192px, 224px"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-4 md:pt-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {movie.title}
            </h1>

            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-foreground-muted text-sm mt-1">
                {movie.originalTitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-text-muted">
              {releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {releaseYear}
                </span>
              )}
              {movie.runtimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatRuntime(movie.runtimeMinutes)}
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {movie.language.name}
                </span>
              )}
              {movie.country && <span>{movie.country.name}</span>}
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {genres.map((g) => (
                  <GenreBadge
                    key={g.id}
                    genre={g.name}
                    href={`/explore?genre=${encodeURIComponent(g.name)}`}
                  />
                ))}
              </div>
            )}

            {averageRating > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 bg-rating/10 border border-rating/20 rounded-lg px-3 py-1.5">
                  <Star className="h-4 w-4 text-rating fill-rating" />
                  <span className="text-base font-bold text-foreground">
                    {formatRating(averageRating)}
                  </span>
                  <span className="text-xs text-text-muted">/10</span>
                </div>
                {movie.ratingsCount > 0 && (
                  <span className="text-xs text-text-muted">
                    {movie.ratingsCount} ratings
                  </span>
                )}
              </div>
            )}

            {movie.synopsis && (
              <p className="mt-5 text-sm sm:text-base text-foreground-muted leading-relaxed max-w-2xl">
                {movie.synopsis}
              </p>
            )}

            {directors.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Directed by
                </span>
                <p className="text-sm text-foreground mt-0.5">
                  {directors.map((d) => d.person.fullName).join(", ")}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              {movie.trailers[0] && (
                <Button asChild>
                  <a
                    href={movie.trailers[0].youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4" />
                    Watch Trailer
                  </a>
                </Button>
              )}
              <Button
                variant={inWatchlist ? "secondary" : "outline"}
                onClick={() => setInWatchlist(!inWatchlist)}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </div>

            {movie.sources.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.sources.map((src) => (
                  <a
                    key={src.sourceUrl}
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-muted border border-accent/30 hover:border-accent/60 rounded-full px-3 py-1 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Watch on {src.sourceName}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="cast">
            <TabsList>
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </TabsTrigger>
              {movie.trailers.length > 0 && (
                <TabsTrigger value="trailers">Trailers</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="cast">
              {cast.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {cast.map((c) => (
                      <div
                        key={c.person.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
                      >
                        <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-surface-raised flex items-center justify-center">
                          {c.person.photoUrl ? (
                            <img
                              src={c.person.photoUrl}
                              alt={c.person.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-text-muted font-medium">
                              {c.person.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {c.person.fullName}
                          </p>
                          {c.characterName && (
                            <p className="text-xs text-text-muted truncate">
                              {c.characterName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {crew.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Crew</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {crew.map((c) => (
                      <div
                        key={`${c.person.id}-${c.role}`}
                        className="flex items-center justify-between py-1.5 border-b border-border-muted"
                      >
                        <span className="text-xs text-text-muted">
                          {ROLE_LABELS[c.role] ?? c.role}
                        </span>
                        <span className="text-xs text-foreground font-medium">
                          {c.person.fullName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cast.length === 0 && crew.length === 0 && (
                <EmptyState
                  title="No credits available"
                  description="Cast and crew information coming soon."
                />
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  description="Be the first to review this film."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>

            {movie.trailers.length > 0 && (
              <TabsContent value="trailers">
                <div className="grid gap-4 sm:grid-cols-2">
                  {movie.trailers.map((t) => {
                    const ytId = t.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
                    return (
                      <div key={t.id} className="rounded-lg overflow-hidden bg-surface border border-border">
                        <div className="aspect-video">
                          {ytId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={t.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          ) : (
                            <a
                              href={t.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center h-full text-sm text-accent"
                            >
                              Watch Trailer
                            </a>
                          )}
                        </div>
                        <p className="px-3 py-2 text-sm text-foreground-muted">{t.title}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="pb-20" />
      </div>
    </div>
  );
}
