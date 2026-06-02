import { Injectable } from "@nestjs/common";
import type { MovieSummary, PaginatedResponse } from "@letterboxd-et/shared";
import { PrismaService } from "../prisma/prisma.service";
import { MovieQueryDto } from "./dto/movie-query.dto";

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
                { title: { contains: query.query, mode: "insensitive" as const } },
                { originalTitle: { contains: query.query, mode: "insensitive" as const } },
                { synopsis: { contains: query.query, mode: "insensitive" as const } }
              ]
            }
          : {},
        query.language ? { primaryLanguage: query.language } : {},
        query.genre
          ? {
              genres: {
                some: {
                  genre: {
                    slug: query.genre
                  }
                }
              }
            }
          : {}
      ]
    };

    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where,
        include: movieSummaryInclude,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.movie.count({ where })
    ]);

    return {
      data: movies.map(toMovieSummary),
      page,
      pageSize,
      total
    };
  }

  async featured(): Promise<MovieSummary[]> {
    const movies = await this.prisma.movie.findMany({
      include: movieSummaryInclude,
      orderBy: { updatedAt: "desc" },
      take: 6
    });

    return movies.map(toMovieSummary);
  }
}

const movieSummaryInclude = {
  genres: { include: { genre: true } },
  credits: {
    where: { role: "DIRECTOR" as const },
    include: { person: true },
    orderBy: { order: "asc" as const }
  },
  ratings: true,
  reviews: true
};

function toMovieSummary(movie: {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseDate: Date | null;
  synopsis: string | null;
  posterUrl: string | null;
  genres: { genre: { name: string } }[];
  credits: { person: { name: string } }[];
  ratings: { value: unknown }[];
  reviews: unknown[];
}): MovieSummary {
  const ratings = movie.ratings.map((rating) => Number(rating.value));
  const averageRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    originalTitle: movie.originalTitle,
    releaseYear: movie.releaseDate?.getFullYear() ?? null,
    synopsis: movie.synopsis,
    posterUrl: movie.posterUrl,
    averageRating,
    reviewCount: movie.reviews.length,
    genres: movie.genres.map((item) => item.genre.name),
    directors: movie.credits.map((credit) => credit.person.name)
  };
}
