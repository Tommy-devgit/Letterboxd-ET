"use client";

import Link from "next/link";
import {
  Activity,
  Clapperboard,
  Heart,
  ListPlus,
  MessageSquare,
  Play,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCarousel, MovieCarouselSkeleton } from "@/components/movie/movie-carousel";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { ErrorState } from "@/components/common/error-state";
import { useFeaturedMovies, useMovies } from "@/hooks/use-movies";
import { MoviePoster } from "@/components/movie/movie-poster";
import { truncate, formatRating, cn } from "@/lib/utils";
import {
  buildActivity,
  popularActors,
  popularDirectors,
  seedLists,
  seedReviews,
} from "@/lib/letterboxd-et-seed";
import type { MovieSummary } from "@/types";

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

function LetterboxdSectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3 lb-section-rule pt-2">
      <h2 className="lb-section-title">{title}</h2>
      {href && (
        <Link href={href} className="ml-auto lb-caption uppercase tracking-[0.1em] transition-colors hover:text-[#d8e0e8]">
          More
        </Link>
      )}
    </div>
  );
}

function LetterboxdPosterSection({
  title,
  movies,
  isLoading,
  href = "/explore",
}: {
  title: string;
  movies: MovieSummary[];
  isLoading: boolean;
  href?: string;
}) {
  return (
    <section className="mt-8">
      <LetterboxdSectionHeader title={title} href={href} />
      {isLoading ? <MovieCarouselSkeleton count={6} /> : <MovieCarousel movies={movies.slice(0, 10)} />}
    </section>
  );
}

function LetterboxdReviews({ movies }: { movies: MovieSummary[] }) {
  return (
    <section className="mt-8">
      <LetterboxdSectionHeader title="New Reviews" href="/reviews" />
      <div className="grid gap-3 md:grid-cols-2">
        {seedReviews.slice(0, 6).map((review, index) => {
          const movie = movies[index % Math.max(movies.length, 1)];
          return (
            <article key={review.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-3 transition-colors hover:border-[#536575]">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1d2a35] text-xs font-bold text-[#9aa8b5]">
                  {review.user.username.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#d8e0e8]">{review.user.username}</p>
                  <p className="lb-caption">reviewed {movie?.title ?? review.movieTitle}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#54b948]">
                  <Star className="h-3 w-3 fill-[#54b948]" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="lb-body line-clamp-3 text-[0.88rem]">{review.content}</p>
              <div className="mt-3 flex items-center gap-4 lb-caption">
                <span>{review.likes} likes</span>
                <span>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LetterboxdLists({ movies }: { movies: MovieSummary[] }) {
  return (
    <section className="mt-8">
      <LetterboxdSectionHeader title="Popular Lists" href="/lists" />
      <div className="grid gap-3 md:grid-cols-2">
        {seedLists.map((list, index) => (
          <Link key={list.id} href="/lists" className="rounded-[4px] border border-border-muted bg-[#101820] p-3 transition-colors hover:border-[#f2c94c]/50">
            <div className="mb-3 flex -space-x-2 overflow-hidden">
              {movies.slice(index, index + 5).map((movie) => (
                <div key={movie.id} className="relative h-16 w-11 shrink-0 overflow-hidden rounded-[3px] ring-2 ring-[#101820]">
                  <MoviePoster src={movie.posterUrl} alt={movie.title} fill sizes="44px" />
                </div>
              ))}
            </div>
            <h3 className="lb-heading">{list.title}</h3>
            <p className="mt-1 lb-caption line-clamp-2">{list.description}</p>
            <p className="mt-3 lb-caption">by {list.author} - {list.likes} likes - {list.comments} comments</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LetterboxdPeople({ title, people }: { title: string; people: string[] }) {
  return (
    <section className="mt-8">
      <LetterboxdSectionHeader title={title} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {people.map((person, index) => (
          <Link key={person} href="/members" className="flex items-center gap-2 rounded-[4px] border border-border-muted bg-[#101820] p-2 transition-colors hover:border-[#54b948]/50">
            <span className={cn(
              "grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-[#0b1117]",
              index % 3 === 0 && "bg-[#54b948]",
              index % 3 === 1 && "bg-[#f2c94c]",
              index % 3 === 2 && "bg-[#e0362d] text-white"
            )}>
              {person.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-[#cfd8e1]">{person}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LetterboxdTrailers({ movies }: { movies: MovieSummary[] }) {
  return (
    <section className="mt-8">
      <LetterboxdSectionHeader title="Recently Added Trailers" />
      <div className="grid gap-3 md:grid-cols-3">
        {movies.slice(0, 3).map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.slug}`} className="group overflow-hidden rounded-[4px] border border-border-muted bg-[#101820]">
            <div className="relative aspect-video bg-[#0b1117]">
              <MoviePoster src={movie.posterUrl} alt={movie.title} fill sizes="33vw" className="opacity-70 transition-opacity group-hover:opacity-90" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e0362d] text-white shadow-lg">
                  <Play className="ml-0.5 h-5 w-5 fill-white" />
                </span>
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-[#d8e0e8]">{movie.title}</h3>
              <p className="lb-caption">{truncate(movie.synopsis ?? "Trailer and clips now available.", 70)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LetterboxdActivity({ movies }: { movies: MovieSummary[] }) {
  const activity = buildActivity(movies);
  const icons = {
    watched: Clapperboard,
    rated: Star,
    reviewed: MessageSquare,
    watchlisted: Heart,
    listed: ListPlus,
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-3 lb-section-rule pt-2">
        <h2 className="lb-section-title">Community Activity</h2>
        <Activity className="ml-auto h-4 w-4 text-[#667484]" />
        <Link href="/activity" className="lb-caption uppercase tracking-[0.1em] transition-colors hover:text-[#d8e0e8]">More</Link>
      </div>
      <div className="divide-y divide-border-muted rounded-[4px] border border-border-muted bg-[#101820]">
        {activity.slice(0, 10).map((item) => {
          const Icon = icons[item.action];
          return (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-[#54b948]" />
              <p className="min-w-0 flex-1 text-sm text-[#9aa8b5]">
                <span className="font-semibold text-[#d8e0e8]">{item.user}</span>{" "}
                {item.action === "watchlisted" ? "added to watchlist" : item.action}{" "}
                <span className="font-semibold text-[#cfd8e1]">{item.subject}</span>
              </p>
              <span className="lb-caption shrink-0">{item.meta}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const featured = useFeaturedMovies();
  const latest = useMovies({ page: 1, pageSize: 24 });
  const featuredMovies = featured.data ?? [];
  const allMovies = latest.data?.data ?? featuredMovies;
  const popular = [...allMovies].sort((a, b) => b.averageRating - a.averageRating);
  const trending = [...allMovies].sort((a, b) => b.reviewCount - a.reviewCount);

  return (
    <div className="pb-16 pt-8">
      <div className="lb-container">
        <header className="mb-7 text-center">
          <p className="lb-display text-[#8796a6]">
            Welcome back. Here is what Ethiopian film lovers have been watching...
          </p>
        </header>

        {latest.error && <ErrorState description="Could not load the film feed." retry={() => latest.refetch()} />}
        {featured.error && <ErrorState description="Could not load featured films." retry={() => featured.refetch()} />}

        <LetterboxdPosterSection title="Featured Ethiopian Films" movies={featuredMovies} isLoading={featured.isLoading} />
        <LetterboxdPosterSection title="Popular This Week" movies={popular} isLoading={latest.isLoading} />

        <section className="mt-8">
          <LetterboxdSectionHeader title="Latest Additions" href="/explore" />
          {latest.isLoading ? <MovieGridSkeleton count={12} /> : (
            <MovieGrid movies={allMovies.slice(0, 12)} />
          )}
        </section>

        <LetterboxdPosterSection title="Trending Films" movies={trending} isLoading={latest.isLoading} />
        <LetterboxdReviews movies={allMovies} />
        <LetterboxdLists movies={allMovies} />
        <LetterboxdTrailers movies={allMovies} />
        <LetterboxdPeople title="Popular Actors" people={popularActors} />
        <LetterboxdPeople title="Popular Directors" people={popularDirectors} />
        <LetterboxdActivity movies={allMovies} />
      </div>
    </div>
  );
}
