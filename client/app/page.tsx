"use client";

import Link from "next/link";
import { Play, Star, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCarousel, MovieCarouselSkeleton } from "@/components/movie/movie-carousel";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { ErrorState } from "@/components/common/error-state";
import { useFeaturedMovies, useMovies } from "@/hooks/use-movies";
import { MoviePoster } from "@/components/movie/movie-poster";
import { truncate, formatRating } from "@/lib/utils";

function HeroSection() {
  const { data: featured, isLoading, error } = useFeaturedMovies();

  if (isLoading) {
    return (
      <div className="relative h-[70vh] min-h-[480px] bg-surface-raised animate-pulse" />
    );
  }

  if (error || !featured?.length) {
    return (
      <div className="relative h-[50vh] min-h-[360px] flex items-center justify-center bg-gradient-to-br from-surface to-background">
        <div className="text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Ethiopian Cinema
          </h1>
          <p className="text-lg text-foreground-muted max-w-md mx-auto mb-8">
            Discover, track, and discuss the best of Ethiopian film.
          </p>
          <Button asChild size="lg">
            <Link href="/explore">Explore Films</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hero = featured[0];

  return (
    <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <MoviePoster
          src={hero.posterUrl}
          alt={hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 sm:pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Featured
              </span>
              {hero.averageRating > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Star className="h-3 w-3 text-rating fill-rating" />
                    {formatRating(hero.averageRating)}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
              {hero.title}
            </h1>

            {hero.synopsis && (
              <p className="text-foreground-muted text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                {truncate(hero.synopsis, 200)}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/movie/${hero.slug}`}>
                  <Play className="h-4 w-4" />
                  View Details
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">Explore All Films</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedSection() {
  const { data: featured, isLoading, error, refetch } = useFeaturedMovies();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Top Rated</h2>
        <Link
          href="/explore?sort=rating"
          className="ml-auto text-sm text-accent hover:text-accent-muted transition-colors"
        >
          View all
        </Link>
      </div>

      {isLoading && <MovieCarouselSkeleton count={6} />}
      {error && (
        <ErrorState
          description="Could not load featured films."
          retry={() => refetch()}
        />
      )}
      {featured && (
        <MovieCarousel movies={featured} />
      )}
    </section>
  );
}

function TrendingSection() {
  const { data, isLoading, error, refetch } = useMovies({ page: 1, pageSize: 12 });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Recently Added</h2>
        <Link
          href="/explore"
          className="ml-auto text-sm text-accent hover:text-accent-muted transition-colors"
        >
          View all
        </Link>
      </div>

      {isLoading && <MovieGridSkeleton count={12} />}
      {error && (
        <ErrorState
          description="Could not load movies."
          retry={() => refetch()}
        />
      )}
      {data && <MovieGrid movies={data.data} />}
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <TrendingSection />
      <div className="pb-20" />
    </>
  );
}
