import { MovieCard } from "./movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MovieSummary } from "@/types";

interface MovieGridProps {
  movies: MovieSummary[];
  className?: string;
}

export function MovieGrid({ movies, className }: MovieGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
        className
      )}
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] rounded-lg" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
          <Skeleton className="h-3 w-2/5 rounded" />
        </div>
      ))}
    </div>
  );
}
