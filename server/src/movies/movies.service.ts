import { Injectable, NotFoundException } from '@nestjs/common';
import type { MovieSummary, PaginatedResponse } from '@letterboxd-et/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MovieQueryDto } from './dto/movie-query.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: MovieQueryDto): Promise<PaginatedResponse<MovieSummary>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where = {
      AND: [
        query.query
          ? {
              OR: [
                { title: { contains: query.query, mode: 'insensitive' as const } },
                { originalTitle: { contains: query.query, mode: 'insensitive' as const } },
                { synopsis: { contains: query.query, mode: 'insensitive' as const } },
              ],
            }
          : {},
        // Fix: was `primaryLanguage` (field doesn't exist) — use the relation
        query.language ? { language: { code: query.language } } : {},
        // Fix: was `genre.slug` (Genre has no slug) — match by name case-insensitively
        query.genre
          ? {
              genres: {
                some: {
                  genre: { name: { equals: query.genre, mode: 'insensitive' as const } },
                },
              },
            }
          : {},
      ],
    };

    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where,
        include: movieSummaryInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return { data: movies.map(toMovieSummary), page, pageSize, total };
  }

  async featured(): Promise<MovieSummary[]> {
    const movies = await this.prisma.movie.findMany({
      include: movieSummaryInclude,
      orderBy: { averageRating: 'desc' },
      take: 6,
    });
    return movies.map(toMovieSummary);
  }

  async getBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: movieDetailInclude,
    });
    if (!movie) throw new NotFoundException(`Movie "${slug}" not found`);
    return movie;
  }

  /** Recompute and persist averageRating + ratingsCount from the Ratings table. */
  async recomputeStats(movieId: string): Promise<void> {
    const agg = await this.prisma.rating.aggregate({
      where: { movieId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.movie.update({
      where: { id: movieId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        ratingsCount: agg._count.rating,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Shared includes
// ---------------------------------------------------------------------------

const movieSummaryInclude = {
  genres: { include: { genre: true } },
  // Fix: removed orderBy: { order: "asc" } — MovieCredit has no `order` field
  credits: { where: { role: 'DIRECTOR' as const }, include: { person: true } },
  // Fix: was `ratings: true` selecting all fields including id/timestamps
  ratings: { select: { rating: true } },
  reviews: { select: { id: true } },
} as const;


const movieDetailInclude = {
  genres: { include: { genre: true } },
  country: true,
  language: true,
  credits: { include: { person: true }, orderBy: { role: 'asc' as const } },
  ratings: { select: { rating: true } },
  reviews: {
    include: { user: { select: { id: true, username: true, profilePicture: true } } },
    orderBy: { createdAt: 'desc' as const },
    take: 10,
  },
  trailers: true,
  sources: { select: { sourceName: true, sourceUrl: true } },
} as const;

// ---------------------------------------------------------------------------
// Shape mapper
// ---------------------------------------------------------------------------

function toMovieSummary(movie: {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseDate: Date | null;
  synopsis: string | null;
  posterUrl: string | null;
  contentType: import('@prisma/client').ContentType;
  // Fix: was `{ value: unknown }[]` — field is `rating`
  ratings: { rating: number }[];
  reviews: { id: string }[];
  genres: { genre: { name: string } }[];
  // Fix: was `{ person: { name: string } }[]` — Person uses `fullName`
  credits: { person: { fullName: string } }[];
}): MovieSummary {
  const sum = movie.ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = movie.ratings.length ? sum / movie.ratings.length : 0;

  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    originalTitle: movie.originalTitle,
    releaseYear: movie.releaseDate?.getFullYear() ?? null,
    synopsis: movie.synopsis,
    posterUrl: movie.posterUrl,
    contentType: movie.contentType,
    averageRating,
    reviewCount: movie.reviews.length,
    genres: movie.genres.map((g) => g.genre.name),
    directors: movie.credits.map((c) => c.person.fullName),
  };
}
