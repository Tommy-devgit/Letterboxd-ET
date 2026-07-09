"use client";

import { Star } from "lucide-react";
import { getRatingColor, ratingColors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  valueClassName?: string;
  className?: string;
};

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textClasses = {
  xs: "text-[0.7rem]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function RatingStars({ rating, size = "md", showValue = false, valueClassName, className }: RatingStarsProps) {
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));
  const rounded = Math.round(safeRating * 2) / 2;
  const color = getRatingColor(rounded);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex items-center gap-0.5" aria-label={`${rounded.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, rounded - index));
          return (
            <span key={index} className="relative inline-grid">
              <Star className={cn(sizeClasses[size], "fill-current")} style={{ color: ratingColors.empty }} />
              {fill > 0 ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn(sizeClasses[size], "fill-current")} style={{ color }} />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className={cn("font-semibold", textClasses[size], valueClassName)} style={{ color }}>
          {rounded.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
