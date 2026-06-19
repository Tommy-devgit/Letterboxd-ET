"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { reviewsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { formatStarRating } from "@/lib/utils";

export default function ReviewsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: keys.reviews.recent(1),
    queryFn: () => reviewsApi.recent(1, 48),
  });

  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2"><h1 className="lb-section-title">Reviews</h1></div>
      {isLoading && <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-40 rounded-[4px]" />)}</div>}
      {error && <ErrorState retry={() => refetch()} />}
      <div className="grid gap-3 md:grid-cols-2">
        {(data?.data ?? []).map((review) => (
          <article key={review.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-4 transition-colors hover:border-[#536575]">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1d2a35] text-xs font-bold text-[#9aa8b5]">{review.user.username.slice(0, 2).toUpperCase()}</span>
              <div><p className="text-sm font-semibold text-[#d8e0e8]">{review.user.username}</p><p className="lb-caption">reviewed {review.movie?.title ?? "a film"}</p></div>
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#54b948]"><Star className="h-3 w-3 fill-[#54b948]" />{formatStarRating(review.rating)}</span>
            </div>
            <p className="lb-body">{review.content}</p>
            {review.movie && <Link href={`/movie/${review.movie.slug}`} className="mt-3 inline-block lb-caption uppercase tracking-[0.1em] hover:text-[#d8e0e8]">Open film</Link>}
          </article>
        ))}
      </div>
    </div>
  );
}