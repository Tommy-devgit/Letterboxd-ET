import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { RatingStars } from '@/components/movie/rating-stars';
import type { Review } from '@/lib/types';

type ReviewCardProps = {
  review: Review;
  showMovie?: boolean;
};

export function ReviewCard({ review, showMovie = false }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <Avatar src={review.user.profilePicture} alt={review.user.username} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-sm">{review.user.username}</span>
            {showMovie && review.movie && (
              <>
                <span className="text-muted-foreground text-xs">on</span>
                <Link
                  href={`/movies/${review.movie.slug}`}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {review.movie.title}
                </Link>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{date}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-4">
            {review.content}
          </p>
          {(review.likesCount ?? 0) > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              <span>{review.likesCount} likes</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
