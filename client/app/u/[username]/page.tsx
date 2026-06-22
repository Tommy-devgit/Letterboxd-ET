"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Film, Heart, List, MessageSquare, Star } from "lucide-react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { MovieGrid } from "@/components/movie/movie-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersApi } from "@/lib/api";
import { formatStarRating } from "@/lib/utils";

export default function UserProfilePage() {
  const username = useParams().username as string;
  const { data: profile, isLoading, error, refetch } = useQuery({ queryKey: ["user-profile", username], queryFn: () => usersApi.getByUsername(username), enabled: !!username });
  if (isLoading) return <div className="lb-container py-8"><Skeleton className="h-64 rounded-[4px]" /></div>;
  if (error || !profile) return <div className="lb-container py-16"><ErrorState title="Member not found" retry={() => refetch()} /></div>;
  const diaryMovies = profile.diaryEntries?.map((entry) => entry.movie) ?? [];
  const watchlistMovies = profile.watchlist?.map((entry) => entry.movie) ?? [];
  return <div className="lb-container py-8"><header className="mb-8 flex flex-col gap-5 border-b border-border-muted pb-6 sm:flex-row sm:items-end"><span className="grid h-20 w-20 place-items-center rounded-full bg-[#1d2a35] text-2xl font-bold text-[#9aa8b5]">{profile.username.slice(0, 2).toUpperCase()}</span><div className="flex-1"><h1 className="text-3xl font-semibold text-[#d8e0e8]">{profile.username}</h1>{profile.bio && <p className="mt-2 max-w-2xl lb-body">{profile.bio}</p>}<div className="mt-4 grid grid-cols-3 gap-3 text-center sm:flex sm:text-left"><Stat icon={<Star />} label="ratings" value={profile._count?.ratings ?? 0} /><Stat icon={<MessageSquare />} label="reviews" value={profile._count?.reviews ?? 0} /><Stat icon={<CalendarDays />} label="diary" value={profile._count?.diaryEntries ?? 0} /><Stat icon={<List />} label="lists" value={profile._count?.lists ?? 0} /><Stat icon={<Heart />} label="following" value={profile._count?.following ?? 0} /></div></div></header><Tabs defaultValue="films"><TabsList className="rounded-[4px] border border-border-muted bg-[#101820]"><TabsTrigger value="films">Films</TabsTrigger><TabsTrigger value="reviews">Reviews</TabsTrigger><TabsTrigger value="diary">Diary</TabsTrigger><TabsTrigger value="lists">Lists</TabsTrigger><TabsTrigger value="watchlist">Watchlist</TabsTrigger></TabsList><TabsContent value="films">{diaryMovies.length ? <MovieGrid movies={diaryMovies} /> : <EmptyState title="No watched films yet" />}</TabsContent><TabsContent value="reviews"><div className="grid gap-3 md:grid-cols-2">{profile.reviews?.length ? profile.reviews.map((review) => <article key={review.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-4"><p className="lb-caption">{review.movie.title}</p><p className="mt-2 lb-body">{review.content}</p></article>) : <EmptyState title="No reviews yet" />}</div></TabsContent><TabsContent value="diary"><div className="space-y-2">{profile.diaryEntries?.length ? profile.diaryEntries.map((entry) => <Link key={entry.id} href={`/movie/${entry.movie.slug}`} className="flex items-center justify-between rounded-[4px] border border-border-muted bg-[#101820] p-3"><span className="font-semibold text-[#d8e0e8]">{entry.movie.title}</span><span className="lb-caption">{entry.rating ? formatStarRating(entry.rating) : "watched"}</span></Link>) : <EmptyState title="No diary entries yet" />}</div></TabsContent><TabsContent value="lists"><div className="grid gap-3 md:grid-cols-2">{profile.lists?.length ? profile.lists.map((list) => <Link key={list.id} href="/lists" className="rounded-[4px] border border-border-muted bg-[#101820] p-4"><h3 className="font-semibold text-[#d8e0e8]">{list.title}</h3><p className="lb-caption">{list._count?.movies ?? 0} films</p></Link>) : <EmptyState title="No lists yet" />}</div></TabsContent><TabsContent value="watchlist">{watchlistMovies.length ? <MovieGrid movies={watchlistMovies} /> : <EmptyState title="Watchlist is empty" />}</TabsContent></Tabs></div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <span className="rounded-[4px] border border-border-muted bg-[#101820] px-3 py-2"><span className="inline-flex items-center gap-1 text-sm font-semibold text-[#d8e0e8]">{icon}{value}</span><span className="ml-1 lb-caption">{label}</span></span>; }