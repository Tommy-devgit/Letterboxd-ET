import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  max = 10,
  size = "md",
  showValue = false,
  className,
}: RatingStarsProps) {
  const normalized = Math.min(Math.max(rating / max, 0), 1);
  const stars = 5;
  const filled = normalized * stars;

  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const textClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: stars }, (_, i) => {
          const diff = filled - i;
          const isFull = diff >= 1;
          const isHalf = diff > 0 && diff < 1;

          return (
            <div key={i} className="relative">
              <Star
                className={cn(sizeClass, "text-border fill-border")}
              />
              {(isFull || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isFull ? "100%" : `${diff * 100}%` }}
                >
                  <Star
                    className={cn(sizeClass, "text-rating fill-rating")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn(textClass, "text-foreground-muted font-medium ml-1")}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
