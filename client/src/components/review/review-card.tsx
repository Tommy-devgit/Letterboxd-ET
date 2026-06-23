"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit3, Heart, Save, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { reviewsApi } from "@/lib/api";
import { formatDateShort, formatStarRating } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { MovieReview } from "@/types";

interface ReviewCardProps {
  review: MovieReview;
  onChanged?: () => void;
}

export function ReviewCard({ review, onChanged }: ReviewCardProps) {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(review.content);
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  const isOwner = user?.id === review.user.id;
  const initials = review.user.username.slice(0, 2).toUpperCase();

  async function save() {
    setBusy(true);
    try {
      await reviewsApi.update(review.id, { userId: user?.id, content });
      setEditing(false);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await reviewsApi.delete(review.id, user?.id);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function toggleLike() {
    if (!user) return;
    setLiked((value) => !value);
    try {
      if (liked) await reviewsApi.unlike(review.id, user.id);
      else await reviewsApi.like(review.id, user.id);
      onChanged?.();
    } catch {
      setLiked((value) => !value);
    }
  }

  return (
    <article className="rounded-[4px] border border-border-muted bg-[#101820] p-4 transition-colors hover:border-[#4a5b69]">
      <div className="flex items-center gap-3">
        <Link href={`/u/${review.user.username}`} className="shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.user.profilePicture ?? undefined} alt={review.user.username} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/u/${review.user.username}`} className="truncate text-sm font-semibold text-[#d8e0e8] hover:text-white">
            {review.user.username}
          </Link>
          <p className="text-xs text-text-muted">{formatDateShort(review.createdAt)}</p>
        </div>
        {review.rating ? <span className="shrink-0 text-xs font-semibold text-[#54b948]">{formatStarRating(review.rating)}</span> : null}
      </div>

      {editing ? (
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-3 min-h-32 w-full rounded-[4px] border border-border-muted bg-[#0b1117] p-3 text-sm leading-6 text-[#d8e0e8] outline-none transition-colors focus:border-[#54b948]"
        />
      ) : (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#b8c3ce]">{review.content}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border-muted pt-3">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!user || busy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-[#e0362d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-[#e0362d] text-[#e0362d]" : ""}`} />
          {(review.likesCount ?? 0) + (liked ? 1 : 0)}
        </button>
        {isOwner ? (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={busy}>
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={save} disabled={busy || content.trim().length < 3}>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={remove} disabled={busy}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="space-y-3 rounded-[4px] border border-border-muted bg-[#101820] p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-surface-raised" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-surface-raised" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface-raised" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 animate-pulse rounded bg-surface-raised" />
        <div className="h-3.5 w-5/6 animate-pulse rounded bg-surface-raised" />
        <div className="h-3.5 w-4/6 animate-pulse rounded bg-surface-raised" />
      </div>
    </div>
  );
}
