"use client";

import Link from "next/link";
import { BookmarkPlus, Eye } from "lucide-react";
import { RatingStars } from "@/components/common/rating-stars";
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
          "group flex gap-3 rounded-[4px] p-2 transition-colors hover:bg-surface",
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
            <RatingStars rating={movie.averageRating} size="xs" showValue className="mt-0.5" />
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
          "group flex gap-4 rounded-[4px] border border-border bg-card p-3 transition-all hover:border-[#54b948]/50 hover:bg-surface",
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
            <RatingStars rating={movie.averageRating} size="sm" showValue className="flex-col gap-0.5" />
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link href={`/movie/${movie.slug}`} className={cn("group block", className)}>
      <div className="poster-shadow relative aspect-[2/3] overflow-hidden rounded-[4px] bg-surface-raised ring-1 ring-[#3b4856]/70 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.015] group-hover:ring-[#54b948]/80 group-hover:shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
        <MoviePoster
          src={movie.posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className="transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {movie.averageRating > 0 && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-[3px] bg-black/75 px-1.5 py-0.5 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <RatingStars rating={movie.averageRating} size="xs" showValue />
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-black/70 text-[#d8e0e8] backdrop-blur-sm">
            <BookmarkPlus className="h-3.5 w-3.5" />
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-black/70 text-[#d8e0e8] backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs text-white/70 truncate">
            {movie.directors[0]}
          </p>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <h3 className="text-[0.86rem] font-semibold leading-tight text-[#cfd8e1] line-clamp-1 transition-colors group-hover:text-white">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="lb-caption">{movie.releaseYear}</p>
          {movie.reviewCount > 0 && (
            <p className="lb-caption">{movie.reviewCount} reviews</p>
          )}
        </div>
      </div>
    </Link>
  );
}
