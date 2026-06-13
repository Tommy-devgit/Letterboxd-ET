"use client";

import Link from "next/link";
import { List, LogIn, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { listsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatDateShort } from "@/lib/utils";
import { MoviePoster } from "@/components/movie/movie-poster";

function UserLists({ userId }: { userId: string }) {
  const { data: lists, isLoading, error, refetch } = useQuery({
    queryKey: keys.lists.byUser(userId),
    queryFn: () => listsApi.getUserLists(userId),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState retry={() => refetch()} />;

  if (!lists?.length) {
    return (
      <EmptyState
        title="No lists yet"
        description="Create curated lists of your favourite Ethiopian films."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => {
        const covers = list.movies.slice(0, 3).map((m) => m.movie.posterUrl);
        return (
          <Link
            key={list.id}
            href={`/lists/${list.id}`}
            className="group rounded-lg border border-border bg-card hover:border-accent/30 hover:bg-surface transition-all overflow-hidden"
          >
            {/* Cover mosaic */}
            <div className="flex h-28 bg-surface-raised overflow-hidden">
              {covers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-muted">
                  <List className="h-8 w-8 opacity-30" />
                </div>
              ) : (
                covers.map((src, i) => (
                  <div
                    key={i}
                    className="flex-1 relative overflow-hidden"
                    style={{ borderRight: i < covers.length - 1 ? "1px solid #2D3748" : undefined }}
                  >
                    <MoviePoster
                      src={src}
                      alt=""
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {list.title}
              </h3>
              {list.description && (
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                  {list.description}
                </p>
              )}
              <p className="text-xs text-text-muted mt-2">
                {list.movies.length} film{list.movies.length !== 1 ? "s" : ""} · {formatDateShort(list.createdAt)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ListsPage() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <List className="h-6 w-6 text-accent" />
            My Lists
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Curated collections of Ethiopian cinema.
          </p>
        </div>
        {user && (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            New List
          </Button>
        )}
      </div>

      {!user ? (
        <EmptyState
          icon={<List className="h-10 w-10 opacity-40" />}
          title="Sign in to create lists"
          description="Build curated lists of Ethiopian films to share with others."
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
        <UserLists userId={user.id} />
      )}
    </div>
  );
}
