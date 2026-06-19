import Link from "next/link";
import { Star } from "lucide-react";
import { seedReviews } from "@/lib/letterboxd-et-seed";

export default function ReviewsPage() {
  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2">
        <h1 className="lb-section-title">Reviews</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {seedReviews.slice(0, 40).map((review) => (
          <article key={review.id} className="rounded-[4px] border border-border-muted bg-[#101820] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1d2a35] text-xs font-bold text-[#9aa8b5]">
                {review.user.username.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#d8e0e8]">{review.user.username}</p>
                <p className="lb-caption">reviewed {review.movieTitle}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#54b948]">
                <Star className="h-3 w-3 fill-[#54b948]" />
                {review.rating.toFixed(1)}
              </span>
            </div>
            <p className="lb-body">{review.content}</p>
            <Link href="/explore" className="mt-3 inline-block lb-caption uppercase tracking-[0.1em] hover:text-[#d8e0e8]">
              Find film
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
