import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });
    if (existing) throw new ConflictException('Movie already in watchlist');

    return this.prisma.watchlist.create({
      data: { userId, movieId },
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
            select: {
              id: true,
              slug: true,
              title: true,
              posterUrl: true,
              averageRating: true,
              releaseDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.watchlist.count({ where: { userId } }),
    ]);

    return { data: items, page, pageSize, total };
  }
}
