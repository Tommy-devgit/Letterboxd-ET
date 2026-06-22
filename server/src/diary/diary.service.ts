import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaryEntryDto } from './dto/diary.dto';

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async addEntry(userId: string, dto: CreateDiaryEntryDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    const [entry] = await this.prisma.$transaction([
      this.prisma.diaryEntry.create({
        data: {
          userId,
          movieId: dto.movieId,
          watchedAt: dto.watchedAt,
          rating: dto.rating ?? null,
          notes: dto.notes ?? null,
        },
        include: {
          movie: { select: { id: true, slug: true, title: true, posterUrl: true } },
        },
      }),
      // Mark movie as watched (idempotent — upsert ignores duplicates)
      this.prisma.watchedMovie.upsert({
        where: { userId_movieId: { userId, movieId: dto.movieId } },
        create: { userId, movieId: dto.movieId, watchedAt: dto.watchedAt },
        update: {},
      }),
    ]);

    return entry;
  }

  async getEntries(userId: string, page = 1, pageSize = 20) {
    const [entries, total] = await this.prisma.$transaction([
      this.prisma.diaryEntry.findMany({
        where: { userId },
        include: {
          movie: { select: { id: true, slug: true, title: true, posterUrl: true } },
        },
        orderBy: { watchedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.diaryEntry.count({ where: { userId } }),
    ]);

    return { data: entries, page, pageSize, total };
  }
}
