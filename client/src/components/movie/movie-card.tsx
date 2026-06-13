"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoviePoster } from "./movie-poster";
import type { MovieSummary } from "@/types";

interface MovieCardProps {
  movie: MovieSummary;
  className?: string;
  variant?: "default" | "compact" | "wide";
}

export function MovieCard({ movie, className, variant = "default" }: MovieCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/movie/${movie.slug}`}
        className={cn(
          "group flex gap-3 rounded-lg p-2 hover:bg-surface transition-colors",
          className
        )}
      >
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded">
          <MoviePoster
            src={movie.posterUrl}
            alt={movie.title}
            fill
            sizes="44px"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{movie.title}</p>
          <p className="text-xs text-text-muted">{movie.releaseYear}</p>
          {movie.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 text-rating fill-rating" />
              <span className="text-xs text-foreground-muted">
                {movie.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "wide") {
    return (
      <Link
        href={`/movie/${movie.slug}`}
        className={cn(
          "group flex gap-4 rounded-lg border border-border bg-card p-4 hover:border-accent/30 hover:bg-surface transition-all",
          className
        )}
      >
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
          <MoviePoster
            src={movie.posterUrl}
            alt={movie.title}
            fill
            sizes="64px"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between min-w-0 py-0.5">
          <div>
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {movie.directors[0]} · {movie.releaseYear}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-xs px-1.5 py-0.5 rounded-full bg-surface-raised text-text-muted border border-border"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        {movie.averageRating > 0 && (
          <div className="ml-auto flex flex-col items-center justify-center shrink-0 pl-4">
            <Star className="h-4 w-4 text-rating fill-rating" />
            <span className="text-sm font-medium text-foreground-muted mt-0.5">
              {movie.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/movie/${movie.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-raised ring-1 ring-border/50 transition-all duration-300 group-hover:ring-accent/50 group-hover:shadow-lg group-hover:shadow-accent/10">
        <MoviePoster
          src={movie.posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating pill */}
        {movie.averageRating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="h-3 w-3 text-rating fill-rating" />
            <span className="text-xs font-medium text-white">
              {movie.averageRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-white/70 truncate">
            {movie.directors[0]}
          </p>
        </div>
      </div>

      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-text-muted">{movie.releaseYear}</p>
      </div>
    </Link>
  );
}
