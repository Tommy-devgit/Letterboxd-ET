import { formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { MovieReview } from "@/types";

interface ReviewCardProps {
  review: MovieReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.user.username.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={review.user.profilePicture ?? undefined}
            alt={review.user.username}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {review.user.username}
          </p>
          <p className="text-xs text-text-muted">
            {formatDateShort(review.createdAt)}
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground-muted leading-relaxed line-clamp-4">
        {review.content}
      </p>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-surface-raised animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-24 bg-surface-raised rounded animate-pulse" />
          <div className="h-3 w-16 bg-surface-raised rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-surface-raised rounded animate-pulse" />
        <div className="h-3.5 bg-surface-raised rounded animate-pulse w-5/6" />
        <div className="h-3.5 bg-surface-raised rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}
