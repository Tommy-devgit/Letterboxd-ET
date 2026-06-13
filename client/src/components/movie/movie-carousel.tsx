"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovieCard } from "./movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovieSummary } from "@/types";

interface MovieCarouselProps {
  movies: MovieSummary[];
  title?: string;
  viewAllHref?: string;
  className?: string;
}

export function MovieCarousel({
  movies,
  title,
  viewAllHref,
  className,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("relative", className)}>
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {viewAllHref && (
              <a
                href={viewAllHref}
                className="text-sm text-accent hover:text-accent-muted transition-colors mr-2"
              >
                View all
              </a>
            )}
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-accent/50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-accent/50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="w-[140px] sm:w-[160px] shrink-0">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function MovieCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[140px] sm:w-[160px] shrink-0 space-y-2">
          <Skeleton className="aspect-[2/3] rounded-lg" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
          <Skeleton className="h-3 w-2/5 rounded" />
        </div>
      ))}
    </div>
  );
}
