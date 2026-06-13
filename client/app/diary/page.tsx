"use client";

import Link from "next/link";
import { BookOpen, LogIn, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { MoviePoster } from "@/components/movie/movie-poster";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { diaryApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatDateShort } from "@/lib/utils";
import { useState } from "react";

function DiaryList({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: keys.diary.list(userId, page),
    queryFn: () => diaryApi.get(userId, page),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState retry={() => refetch()} />;

  const entries = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Your diary is empty"
        description="Log films you've watched to build your personal diary."
        action={
          <Button asChild variant="outline">
            <Link href="/explore">Find Films to Watch</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/movie/${entry.movie.slug}`}
            className="flex gap-4 rounded-lg border border-border bg-card p-3 hover:border-accent/30 hover:bg-surface transition-all group"
          >
            <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded">
              <MoviePoster
                src={entry.movie.posterUrl}
                alt={entry.movie.title}
                fill
                sizes="44px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                {entry.movie.title}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Watched {formatDateShort(entry.watchedAt)}
              </p>
              {entry.notes && (
                <p className="text-xs text-foreground-muted mt-1 line-clamp-1">
                  {entry.notes}
                </p>
              )}
            </div>
            {entry.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3.5 w-3.5 text-rating fill-rating" />
                <span className="text-sm font-medium text-foreground-muted">
                  {entry.rating}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </>
  );
}

export default function DiaryPage() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          Film Diary
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Your personal log of watched films.
        </p>
      </div>

      {!user ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10 opacity-40" />}
          title="Sign in to view your diary"
          description="Track every film you watch with dates, ratings, and notes."
          action={
            <Button asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          }
        />
      ) : (
        <DiaryList userId={user.id} />
      )}
    </div>
  );
}
