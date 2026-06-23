import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    return this.prisma.watchlist.upsert({
      where: { userId_movieId: { userId, movieId } },
      create: { userId, movieId },
      update: {},
      include: {
        movie: { select: { id: true, slug: true, title: true, posterUrl: true } },
      },
    });
  }

  async remove(userId: string, movieId: string) {
    await this.prisma.watchlist.deleteMany({ where: { userId, movieId } });
    return { success: true };
  }

  async getWatchlist(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.watchlist.findMany({
        where: { userId },
        include: {
          movie: {
            include: watchlistMovieInclude,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.watchlist.count({ where: { userId } }),
    ]);

    return {
      data: items.map((item) => ({
        createdAt: item.createdAt,
        movie: toMovieSummary(item.movie),
      })),
      page,
      pageSize,
      total,
    };
  }
}

const watchlistMovieInclude = {
  genres: { include: { genre: true } },
  credits: {
    where: { role: 'DIRECTOR' as const },
    include: { person: true },
    take: 3,
  },
  _count: { select: { reviews: true } },
} as const;

function toMovieSummary(movie: any) {
  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    originalTitle: movie.originalTitle ?? null,
    releaseYear: movie.releaseDate ? movie.releaseDate.getFullYear() : null,
    synopsis: movie.synopsis ?? null,
    posterUrl: movie.posterUrl ?? null,
    averageRating: movie.averageRating ?? 0,
    reviewCount: movie._count?.reviews ?? 0,
    genres: movie.genres?.map((entry: any) => entry.genre.name) ?? [],
    directors: movie.credits?.map((credit: any) => credit.person.fullName) ?? [],
  };
}
