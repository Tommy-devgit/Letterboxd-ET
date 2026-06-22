"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkCheck, BookmarkPlus, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ratingsApi, reviewsApi, watchlistApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatStarRating } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { MovieReview } from "@/types";

const ratingValues = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

interface MovieActionPanelProps {
  movieId: string;
  movieSlug: string;
  reviews: MovieReview[];
}

export function MovieActionPanel({ movieId, movieSlug, reviews }: MovieActionPanelProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [watchlisted, setWatchlisted] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const mine = useMemo(() => reviews.find((review) => review.user.id === user?.id), [reviews, user?.id]);

  const myRating = useQuery({
    queryKey: user ? keys.ratings.mine(movieId, user.id) : ["ratings", "guest", movieId],
    queryFn: () => ratingsApi.getMyRating(movieId),
    enabled: Boolean(user),
    retry: false,
  });

  useEffect(() => {
    if (myRating.data?.rating) setRating(myRating.data.rating);
  }, [myRating.data?.rating]);

  useEffect(() => {
    if (mine?.content) setContent(mine.content);
  }, [mine?.content]);

  async function invalidateMovie() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.movies.detail(movieSlug) }),
      queryClient.invalidateQueries({ queryKey: keys.movies.reviews(movieId, 1) }),
      queryClient.invalidateQueries({ queryKey: keys.reviews.recent(1) }),
    ]);
  }

  async function submitRating(value: number) {
    if (!user) return;
    setRating(value);
    setBusy("rating");
    try {
      await ratingsApi.rate(movieId, { rating: value });
      await invalidateMovie();
    } finally {
      setBusy(null);
    }
  }

  async function toggleWatchlist() {
    if (!user) return;
    setBusy("watchlist");
    try {
      if (watchlisted) await watchlistApi.remove(movieId);
      else await watchlistApi.add(movieId);
      setWatchlisted((value) => !value);
      await queryClient.invalidateQueries({ queryKey: keys.watchlist.all });
    } finally {
      setBusy(null);
    }
  }

  async function submitReview() {
    if (!user || content.trim().length < 3) return;
    setBusy("review");
    try {
      await reviewsApi.create({ movieId, content: content.trim() });
      await invalidateMovie();
    } finally {
      setBusy(null);
    }
  }

  if (!user) {
    return (
      <div className="mb-5 rounded-[4px] border border-border-muted bg-[#101820] p-4">
        <p className="text-sm font-semibold text-[#d8e0e8]">Sign in to rate, review, or save this film.</p>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm">
            <Link href={`/login?next=/movie/${movieSlug}`}>Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/register?next=/movie/${movieSlug}`}>Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 grid gap-4 rounded-[4px] border border-border-muted bg-[#101820] p-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <p className="lb-section-title">Your Rating</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ratingValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => submitRating(value)}
              disabled={busy === "rating"}
              className={`rounded-[3px] border px-2 py-1 text-xs font-semibold transition-colors ${
                rating === value
                  ? "border-[#54b948] bg-[#54b948]/15 text-[#bfe8b9]"
                  : "border-border-muted text-text-muted hover:border-[#54b948]/50 hover:text-[#d8e0e8]"
              }`}
            >
              {formatStarRating(value)}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={toggleWatchlist} disabled={busy === "watchlist"} className="mt-4 w-full">
          {watchlisted ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
          {watchlisted ? "In Watchlist" : "Watchlist"}
        </Button>
      </div>
      <div>
        <label className="lb-section-title flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-[#f2c94c]" />
          {mine ? "Update Your Review" : "Write a Review"}
        </label>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-3 min-h-28 w-full rounded-[4px] border border-border-muted bg-[#0b1117] p-3 text-sm leading-6 text-[#d8e0e8] outline-none transition-colors focus:border-[#54b948]"
          placeholder="Share what stayed with you after watching..."
        />
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={submitReview} disabled={busy === "review" || content.trim().length < 3}>
            <Send className="h-4 w-4" />
            {mine ? "Update review" : "Post review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
