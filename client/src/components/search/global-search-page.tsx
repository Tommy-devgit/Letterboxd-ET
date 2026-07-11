"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { MoviePoster } from "@/components/movie/movie-poster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchApi } from "@/lib/api";
import { formatDateShort, pluralize, truncate } from "@/lib/utils";

type SearchTab = "movies" | "people" | "users" | "lists";

export function GlobalSearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("movies");
  const results = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.global(query, 12),
    enabled: Boolean(query),
  });
  const counts = {
    movies: results.data?.movies.length ?? 0,
    people: results.data?.people.length ?? 0,
    users: results.data?.users.length ?? 0,
    lists: results.data?.lists.length ?? 0,
  };

  function handleSearch() {
    const trimmed = input.trim();
    if (trimmed) setQuery(trimmed);
  }

  return (
    <div className="lb-container py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-foreground">Search Letterboxd-ET</h1>
        <p className="mt-2 text-sm text-foreground-muted">Find films, cast and crew, members, and public lists.</p>
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input className="h-11 pl-9" placeholder="Search movies, people, members, lists..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearch()} autoFocus />
          </div>
          <Button onClick={handleSearch} size="lg">Search</Button>
        </div>
      </div>
      {!query ? <EmptyState title="Start searching" description="A single search now spans the whole community." icon={<Search className="h-10 w-10 opacity-40" />} /> : null}
      {results.isLoading ? <div className="mt-8 grid gap-3 md:grid-cols-2">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-28 rounded-[4px]" />)}</div> : null}
      {results.error ? <div className="mt-8"><ErrorState retry={() => results.refetch()} /></div> : null}
      {results.data ? (
        <section className="mt-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {(["movies", "people", "users", "lists"] as SearchTab[]).map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-[4px] border px-3 py-2 text-sm font-semibold capitalize ${tab === item ? "border-[#54b948] bg-[#54b948]/15 text-[#d8e0e8]" : "border-border-muted bg-[#101820] text-text-muted hover:text-foreground"}`}>
                {item} ({counts[item]})
              </button>
            ))}
          </div>
          <p className="mb-4 text-sm text-text-muted">{pluralize(counts[tab], "result")} for &ldquo;{query}&rdquo;</p>
          {tab === "movies" && (results.data.movies.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{results.data.movies.map((movie) => <Link key={movie.id} href={`/movie/${movie.slug}`}><div className="relative aspect-[2/3] overflow-hidden rounded-[4px] ring-1 ring-[#3b4856]/70"><MoviePoster src={movie.posterUrl} alt={movie.title} fill sizes="180px" /></div><h2 className="mt-2 truncate text-sm font-semibold text-foreground">{movie.title}</h2>{movie.averageRating ? <RatingStars rating={movie.averageRating} size="xs" showValue /> : null}</Link>)}</div> : <EmptyState title="No movies found" />)}
          {tab === "people" && (results.data.people.length ? <div className="grid gap-3 md:grid-cols-2">{results.data.people.map((person) => <Link key={person.id} href={`/people/${person.id}`} className="flex items-center gap-3 rounded-[4px] border border-border-muted bg-[#101820] p-3 hover:border-[#536575]"><AvatarLike name={person.fullName} src={person.photoUrl} /><div><h2 className="font-semibold text-foreground">{person.fullName}</h2><p className="lb-caption">{person._count.credits} credits</p></div></Link>)}</div> : <EmptyState title="No people found" />)}
          {tab === "users" && (results.data.users.length ? <div className="grid gap-3 md:grid-cols-2">{results.data.users.map((user) => <Link key={user.id} href={`/u/${user.username}`} className="flex items-center gap-3 rounded-[4px] border border-border-muted bg-[#101820] p-3 hover:border-[#536575]"><AvatarLike name={user.username} src={user.profilePicture} /><div><h2 className="font-semibold text-foreground">{user.username}</h2><p className="lb-caption">{user._count?.followers ?? 0} followers - {user._count?.reviews ?? 0} reviews</p>{user.bio ? <p className="mt-1 text-sm text-[#b8c3ce]">{truncate(user.bio, 100)}</p> : null}</div></Link>)}</div> : <EmptyState title="No members found" />)}
          {tab === "lists" && (results.data.lists.length ? <div className="grid gap-3 md:grid-cols-2">{results.data.lists.map((list) => <Link key={list.id} href={`/lists/${list.id}`} className="rounded-[4px] border border-border-muted bg-[#101820] p-4 hover:border-[#536575]"><h2 className="font-semibold text-foreground">{list.title}</h2>{list.description ? <p className="mt-2 text-sm text-[#b8c3ce]">{truncate(list.description, 120)}</p> : null}<p className="mt-4 lb-caption">{list._count?.movies ?? 0} films - {list.user?.username ?? "Member"} - {formatDateShort(list.createdAt)}</p></Link>)}</div> : <EmptyState title="No lists found" />)}
        </section>
      ) : null}
    </div>
  );
}

function AvatarLike({ name, src }: { name: string; src: string | null | undefined }) {
  return <Avatar className="h-12 w-12"><AvatarImage src={src ?? undefined} alt={name} /><AvatarFallback><UserRound className="h-5 w-5" /></AvatarFallback></Avatar>;
}
