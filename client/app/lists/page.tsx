"use client";

import Link from "next/link";
import { List, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { MoviePoster } from "@/components/movie/movie-poster";
import { listsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatDateShort } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export default function ListsPage() {
  const { user } = useAuthStore();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: keys.lists.public(1), queryFn: () => listsApi.getPublicLists(1, 36) });
  const lists = data?.data ?? [];
  return <div className="lb-container py-8"><div className="mb-8 flex items-center justify-between"><div><h1 className="flex items-center gap-2 text-2xl font-semibold text-[#d8e0e8]"><List className="h-6 w-6 text-[#f2c94c]" />Lists</h1><p className="mt-1 lb-caption">Community collections of Ethiopian cinema.</p></div><Button asChild variant="outline" size="sm"><Link href={user ? "/lists/new" : "/login?next=/lists/new"}><Plus className="h-4 w-4" />New List</Link></Button></div>{isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-40 rounded-[4px]" />)}</div>}{error && <ErrorState retry={() => refetch()} />}{!isLoading && lists.length === 0 && <EmptyState title="No lists yet" description="Seed the database or create the first community list." />}{lists.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{lists.map((list) => <Link key={list.id} href={`/lists/${list.id}`} className="group overflow-hidden rounded-[4px] border border-border-muted bg-[#101820] transition-colors hover:border-[#f2c94c]/50"><div className="flex h-28 bg-surface-raised">{list.movies?.length ? list.movies.slice(0, 4).map((item) => <div key={item.movie.id} className="relative flex-1 overflow-hidden border-r border-[#101820]"><MoviePoster src={item.movie.posterUrl} alt={item.movie.title} fill sizes="120px" /></div>) : <div className="grid flex-1 place-items-center text-text-muted"><List className="h-8 w-8 opacity-30" /></div>}</div><div className="p-3"><h3 className="text-sm font-semibold text-[#d8e0e8] transition-colors group-hover:text-white">{list.title}</h3>{list.description && <p className="mt-1 lb-caption line-clamp-2">{list.description}</p>}<p className="mt-3 lb-caption">by {list.user?.username ?? "member"} - {list._count?.movies ?? list.movies?.length ?? 0} films - {formatDateShort(list.createdAt)}</p></div></Link>)}</div>}</div>;
}