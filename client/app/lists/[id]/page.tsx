"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/common/error-state";
import { RatingStars } from "@/components/common/rating-stars";
import { MoviePoster } from "@/components/movie/movie-poster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listsApi, moviesApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatDateShort } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export default function ListDetailPage() {
  const id = useParams().id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const listQuery = useQuery({ queryKey: keys.lists.detail(id), queryFn: () => listsApi.getList(id) });
  const searchQuery = useQuery({
    queryKey: keys.movies.list({ query, page: 1, pageSize: 8 }),
    queryFn: () => moviesApi.list({ query, page: 1, pageSize: 8 }),
    enabled: query.trim().length > 1,
  });
  const list = listQuery.data;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const owner = Boolean(user && list?.user?.id === user.id);
  const existingMovieIds = useMemo(() => new Set(list?.movies.map((item) => item.movie.id) ?? []), [list?.movies]);

  if (listQuery.isLoading) return <div className="lb-container py-8"><div className="h-64 animate-pulse rounded-[4px] bg-[#101820]" /></div>;
  if (listQuery.error || !list) return <div className="lb-container py-16"><ErrorState title="List not found" retry={() => listQuery.refetch()} /></div>;

  function startEditing() {
    setTitle(list?.title ?? "");
    setDescription(list?.description ?? "");
    setEditing(true);
  }

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.lists.detail(id) }),
      queryClient.invalidateQueries({ queryKey: keys.lists.all }),
    ]);
  }

  async function saveList() {
    setBusy(true);
    try {
      await listsApi.update(id, { title: title.trim(), description: description.trim() });
      setEditing(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteList() {
    setBusy(true);
    try {
      await listsApi.delete(id);
      router.push("/lists");
    } finally {
      setBusy(false);
    }
  }

  async function addMovie(movieId: string) {
    setBusy(true);
    try {
      await listsApi.addMovie(id, { movieId, position: listQuery.data?.movies.length ?? 0 });
      setQuery("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeMovie(movieId: string) {
    setBusy(true);
    try {
      await listsApi.removeMovie(id, movieId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lb-container py-8">
      <div className="mb-6 lb-section-rule pt-2">
        {editing ? (
          <div className="max-w-2xl space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full rounded-[4px] border border-border-muted bg-[#0b1117] p-3 text-sm leading-6 text-[#d8e0e8] outline-none transition-colors focus:border-[#54b948]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveList} disabled={busy || title.trim().length === 0}><Save className="h-4 w-4" />Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={busy}><X className="h-4 w-4" />Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#d8e0e8]">{list.title}</h1>
              {list.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#b8c3ce]">{list.description}</p> : null}
              <p className="mt-3 lb-caption">by {list.user?.username ?? "member"} - {list.movies.length} films - {formatDateShort(list.createdAt)}</p>
            </div>
            {owner ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={startEditing}>Edit</Button>
                <Button size="sm" variant="outline" onClick={deleteList} disabled={busy}><Trash2 className="h-4 w-4" />Delete</Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {owner ? (
        <div className="mb-6 rounded-[4px] border border-border-muted bg-[#101820] p-4">
          <p className="lb-section-title">Add Films</p>
          <Input className="mt-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search films to add..." />
          {searchQuery.data?.data?.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {searchQuery.data.data.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => addMovie(movie.id)}
                  disabled={busy || existingMovieIds.has(movie.id)}
                  className="flex items-center gap-2 rounded-[4px] border border-border-muted p-2 text-left transition-colors hover:border-[#54b948]/50 disabled:opacity-50"
                >
                  <span className="relative h-14 w-10 overflow-hidden rounded-[3px] bg-surface-raised"><MoviePoster src={movie.posterUrl} alt={movie.title} fill sizes="40px" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-[#d8e0e8]">{movie.title}</span>
                    <span className="text-xs text-text-muted">{movie.releaseYear ?? ""}</span>
                  </span>
                  <Plus className="h-4 w-4 text-[#54b948]" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.movies.map((item, index) => (
          <div key={item.movie.id} className="group rounded-[4px] border border-border-muted bg-[#101820] p-3">
            <Link href={`/movie/${item.movie.slug}`} className="block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] bg-surface-raised"><MoviePoster src={item.movie.posterUrl} alt={item.movie.title} fill sizes="240px" /></div>
              <p className="mt-3 text-sm font-semibold text-[#d8e0e8] group-hover:text-white">{index + 1}. {item.movie.title}</p>
              <RatingStars rating={item.movie.averageRating} size="xs" showValue className="mt-1" />
            </Link>
            {owner ? <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => removeMovie(item.movie.id)} disabled={busy}>Remove</Button> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
