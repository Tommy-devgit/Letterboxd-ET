"use client";

import Link from "next/link";
import { Clapperboard, Heart, ListPlus, MessageSquare, Play, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { MovieCarousel, MovieCarouselSkeleton } from "@/components/movie/movie-carousel";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { MoviePoster } from "@/components/movie/movie-poster";
import { useFeaturedMovies, useMovies } from "@/hooks/use-movies";
import { activityApi, listsApi, peopleApi, reviewsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { cn, truncate } from "@/lib/utils";
import type { ActivityItem, List, MovieReview, MovieSummary, PersonSummary } from "@/types";

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3 lb-section-rule pt-2">
      <h2 className="lb-section-title">{title}</h2>
      {href && <Link href={href} className="ml-auto lb-caption uppercase tracking-[0.1em] transition-colors hover:text-[#d8e0e8]">More</Link>}
    </div>
  );
}

function PosterSection({ title, movies, isLoading }: { title: string; movies: MovieSummary[]; isLoading: boolean }) {
  return <section className="mt-8"><SectionHeader title={title} href="/explore" />{isLoading ? <MovieCarouselSkeleton count={6} /> : <MovieCarousel movies={movies.slice(0, 10)} />}</section>;
}

function ReviewsSection({ reviews }: { reviews: MovieReview[] }) {
  return (
    <section className="mt-8">
      <SectionHeader title="New Reviews" href="/reviews" />
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.slice(0, 6).map((review) => (
          <article key={review.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-3 transition-colors hover:border-[#536575]">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1d2a35] text-xs font-bold text-[#9aa8b5]">{review.user.username.slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0"><p className="text-sm font-semibold text-[#d8e0e8]">{review.user.username}</p><p className="lb-caption">reviewed {review.movie?.title ?? "a film"}</p></div>
            <RatingStars rating={review.rating} size="xs" showValue className="ml-auto" />
            </div>
            <p className="lb-body line-clamp-3 text-[0.88rem]">{review.content}</p>
            <div className="mt-3 flex items-center gap-4 lb-caption"><span>{review.likesCount ?? 0} likes</span><span>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ListsSection({ lists }: { lists: List[] }) {
  return (
    <section className="mt-8">
      <SectionHeader title="Popular Lists" href="/lists" />
      <div className="grid gap-3 md:grid-cols-2">
        {lists.slice(0, 6).map((list) => (
          <Link key={list.id} href={`/lists/${list.id}`} className="rounded-[4px] border border-border-muted bg-[#101820] p-3 transition-colors hover:border-[#f2c94c]/50">
            <div className="mb-3 flex -space-x-2 overflow-hidden">
              {list.movies?.slice(0, 5).map((item) => <div key={item.movie.id} className="relative h-16 w-11 shrink-0 overflow-hidden rounded-[3px] ring-2 ring-[#101820]"><MoviePoster src={item.movie.posterUrl} alt={item.movie.title} fill sizes="44px" /></div>)}
            </div>
            <h3 className="lb-heading">{list.title}</h3>
            {list.description && <p className="mt-1 lb-caption line-clamp-2">{list.description}</p>}
            <p className="mt-3 lb-caption">by {list.user?.username ?? "member"} - {list._count?.movies ?? list.movies?.length ?? 0} films</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PeopleSection({ title, people }: { title: string; people: PersonSummary[] }) {
  return (
    <section className="mt-8">
      <SectionHeader title={title} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {people.slice(0, 8).map((person, index) => (
          <Link key={person.id} href={`/people/${person.id}`} className="flex items-center gap-2 rounded-[4px] border border-border-muted bg-[#101820] p-2 transition-colors hover:border-[#54b948]/50">
            <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-[#0b1117]", index % 3 === 0 && "bg-[#54b948]", index % 3 === 1 && "bg-[#f2c94c]", index % 3 === 2 && "bg-[#e0362d] text-white")}>{person.fullName.slice(0, 2).toUpperCase()}</span>
            <span className="min-w-0 truncate text-sm font-semibold text-[#cfd8e1]">{person.fullName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrailerSection({ movies }: { movies: MovieSummary[] }) {
  return <section className="mt-8"><SectionHeader title="Recently Added Trailers" /><div className="grid gap-3 md:grid-cols-3">{movies.slice(0, 3).map((movie) => <Link key={movie.id} href={`/movie/${movie.slug}`} className="group overflow-hidden rounded-[4px] border border-border-muted bg-[#101820]"><div className="relative aspect-video bg-[#0b1117]"><MoviePoster src={movie.posterUrl} alt={movie.title} fill sizes="33vw" className="opacity-70 transition-opacity group-hover:opacity-90" /><span className="absolute inset-0 grid place-items-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e0362d] text-white shadow-lg"><Play className="ml-0.5 h-5 w-5 fill-white" /></span></span></div><div className="p-3"><h3 className="text-sm font-semibold text-[#d8e0e8]">{movie.title}</h3><p className="lb-caption">{truncate(movie.synopsis ?? "Trailer and clips now available.", 70)}</p></div></Link>)}</div></section>;
}

function ActivitySection({ items }: { items: ActivityItem[] }) {
  const icons = { watched: Clapperboard, rated: Star, reviewed: MessageSquare, watchlisted: Heart, listed: ListPlus };
  return <section className="mt-8"><SectionHeader title="Community Activity" href="/activity" /><div className="divide-y divide-border-muted rounded-[4px] border border-border-muted bg-[#101820]">{items.slice(0, 10).map((item) => { const Icon = icons[item.type]; const subject = item.movie?.title ?? item.list?.title ?? "a film"; return <div key={item.id} className="flex items-center gap-3 px-3 py-2.5"><Icon className="h-4 w-4 shrink-0 text-[#54b948]" /><p className="min-w-0 flex-1 text-sm text-[#9aa8b5]"><span className="font-semibold text-[#d8e0e8]">{item.user.username}</span> {item.type === "watchlisted" ? "added to watchlist" : item.type} <span className="font-semibold text-[#cfd8e1]">{subject}</span></p>{item.rating ? <RatingStars rating={item.rating} size="xs" showValue className="shrink-0" /> : <span className="lb-caption shrink-0">{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}</div>; })}</div></section>;
}

export default function HomePage() {
  const featured = useFeaturedMovies();
  const latest = useMovies({ page: 1, pageSize: 24 });
  const reviews = useQuery({ queryKey: keys.reviews.recent(1), queryFn: () => reviewsApi.recent(1, 12) });
  const lists = useQuery({ queryKey: keys.lists.public(1), queryFn: () => listsApi.getPublicLists(1, 12) });
  const actors = useQuery({ queryKey: ["people", "actors"], queryFn: () => peopleApi.popular("ACTOR", 8) });
  const directors = useQuery({ queryKey: ["people", "directors"], queryFn: () => peopleApi.popular("DIRECTOR", 8) });
  const activity = useQuery({ queryKey: keys.activity.recent(16), queryFn: () => activityApi.recent(16) });

  const featuredMovies = featured.data ?? [];
  const allMovies = latest.data?.data ?? featuredMovies;
  const popular = [...allMovies].sort((a, b) => b.averageRating - a.averageRating);
  const trending = [...allMovies].sort((a, b) => b.reviewCount - a.reviewCount);

  return (
    <div className="pb-16 pt-8"><div className="lb-container">
      <header className="mb-7 text-center"><p className="lb-display text-[#8796a6]">Welcome back. Here is what Ethiopian film lovers have been watching...</p></header>
      {latest.error && <ErrorState description="Could not load the film feed." retry={() => latest.refetch()} />}
      <PosterSection title="Featured Ethiopian Films" movies={featuredMovies} isLoading={featured.isLoading} />
      <PosterSection title="Popular This Week" movies={popular} isLoading={latest.isLoading} />
      <section className="mt-8"><SectionHeader title="Latest Additions" href="/explore" />{latest.isLoading ? <MovieGridSkeleton count={12} /> : <MovieGrid movies={allMovies.slice(0, 12)} />}</section>
      <PosterSection title="Trending Films" movies={trending} isLoading={latest.isLoading} />
      <ReviewsSection reviews={reviews.data?.data ?? []} />
      <ListsSection lists={lists.data?.data ?? []} />
      <TrailerSection movies={allMovies} />
      <PeopleSection title="Popular Actors" people={actors.data ?? []} />
      <PeopleSection title="Popular Directors" people={directors.data ?? []} />
      <ActivitySection items={activity.data ?? []} />
    </div></div>
  );
}
