'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingStarsProps = {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
};

const starSizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRate,
}: RatingStarsProps) {
  const filled = Math.round(rating * 2) / 2; // half-star precision

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const value = i + 1;
        const isFull = filled >= value;
        const isHalf = !isFull && filled >= value - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(value)}
            className={cn(
              'relative',
              interactive && 'cursor-pointer transition-transform hover:scale-110',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              className={cn(
                starSizes[size],
                isFull
                  ? 'fill-primary text-primary'
                  : isHalf
                  ? 'fill-primary/40 text-primary'
                  : 'fill-transparent text-muted-foreground/40',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
