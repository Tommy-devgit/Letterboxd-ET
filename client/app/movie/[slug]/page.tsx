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
import { useMovies } from "@/hooks/use-movies";
import { MovieCarousel } from "@/components/movie/movie-carousel";
import { reviewsForMovie } from "@/lib/letterboxd-et-seed";
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
  const { data: relatedData } = useMovies({ page: 1, pageSize: 12 });
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
  const seededReviews = reviewsForMovie(movie.title, movie.id);
  const reviews = [...(reviewsData?.data ?? movie.reviews), ...seededReviews];

  const averageRating =
    movie.ratings.length
      ? movie.ratings.reduce((s, r) => s + r.rating, 0) / movie.ratings.length
      : movie.averageRating;

  return (
    <div className="pb-16">
      <div className="relative h-56 overflow-hidden sm:h-72 lg:h-80">
        <MoviePoster
          src={movie.backdropUrl ?? movie.posterUrl}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1117]/20 via-[#0b1117]/70 to-[#0b1117]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1117] via-[#0b1117]/50 to-transparent" />
      </div>

      <div className="lb-container -mt-24 relative">
        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)_230px]">
          <aside className="mx-auto w-44 shrink-0 md:mx-0 md:w-full">
            <div className="poster-shadow relative aspect-[2/3] overflow-hidden rounded-[4px] ring-1 ring-[#4a5b69]">
              <MoviePoster
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 192px, 224px"
                priority
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant={inWatchlist ? "secondary" : "outline"}
                onClick={() => setInWatchlist(!inWatchlist)}
                className="rounded-[4px] border-[#334352] text-xs"
              >
                {inWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                Watchlist
              </Button>
              {movie.trailers[0] && (
                <Button asChild className="rounded-[4px] bg-[#e0362d] text-xs text-white hover:bg-[#c92e27]">
                  <a href={movie.trailers[0].youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4" />
                    Trailer
                  </a>
                </Button>
              )}
            </div>
          </aside>

          <section className="min-w-0 pt-2 md:pt-20">
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.01em] text-[#d8e0e8] md:text-4xl">
              {movie.title}
            </h1>

            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="mt-1 text-sm font-medium text-[#8796a6]">
                {movie.originalTitle}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-[#7e91a2]">
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
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <GenreBadge
                    key={g.id}
                    genre={g.name}
                    href={`/explore?genre=${encodeURIComponent(g.name)}`}
                  />
                ))}
              </div>
            )}

            {movie.synopsis && (
              <p className="mt-5 max-w-2xl text-[0.96rem] leading-7 text-[#b8c3ce]">
                {movie.synopsis}
              </p>
            )}

            {directors.length > 0 && (
              <div className="mt-5 border-t border-border-muted pt-3">
                <span className="lb-section-title">
                  Directed by
                </span>
                <p className="mt-1 text-sm font-semibold text-[#d8e0e8]">
                  {directors.map((d) => d.person.fullName).join(", ")}
                </p>
              </div>
            )}

            {movie.sources.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.sources.map((src) => (
                  <a
                    key={src.sourceUrl}
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#f2c94c]/30 px-3 py-1 text-xs font-semibold text-[#f2c94c] transition-colors hover:border-[#f2c94c]/70"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Watch on {src.sourceName}
                  </a>
                ))}
              </div>
            )}
          </section>

          <aside className="pt-2 md:pt-20">
            <div className="rounded-[4px] border border-border-muted bg-[#101820] p-4">
              <p className="lb-section-title">Ratings</p>
              {averageRating > 0 ? (
                <div className="mt-3 flex items-end gap-2">
                  <Star className="mb-1 h-5 w-5 fill-[#54b948] text-[#54b948]" />
                  <span className="text-3xl font-semibold text-[#d8e0e8]">{formatRating(averageRating)}</span>
                  <span className="pb-1 lb-caption">/10</span>
                </div>
              ) : (
                <p className="mt-3 lb-caption">No ratings yet</p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#d8e0e8]">{movie.ratingsCount || movie.ratings.length}</p>
                  <p className="lb-caption">ratings</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#d8e0e8]">{reviews.length}</p>
                  <p className="lb-caption">reviews</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#d8e0e8]">{movie.trailers.length}</p>
                  <p className="lb-caption">trailers</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="cast">
            <TabsList className="rounded-[4px] border border-border-muted bg-[#101820]">
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
                  <h3 className="lb-section-title mb-3">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {cast.map((c) => (
                      <div
                        key={c.person.id}
                        className="flex items-center gap-2 rounded-[4px] border border-border-muted bg-[#101820] p-2.5"
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
                  <h3 className="lb-section-title mb-3">Crew</h3>
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
                      <div key={t.id} className="rounded-[4px] overflow-hidden bg-surface border border-border">
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

        {relatedData?.data?.length ? (
          <section className="mt-12">
            <div className="mb-3 lb-section-rule pt-2">
              <h2 className="lb-section-title">Related Films</h2>
            </div>
            <MovieCarousel movies={relatedData.data.filter((item) => item.id !== movie.id).slice(0, 10)} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
