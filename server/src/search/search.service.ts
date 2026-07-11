import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, limit = 8) {
    const term = query.trim();
    if (!term) return { movies: [], people: [], users: [], lists: [] };
    const take = Math.min(Math.max(limit, 1), 20);
    const contains = { contains: term, mode: 'insensitive' as const };

    const [movies, people, users, lists] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where: { OR: [{ title: contains }, { originalTitle: contains }, { synopsis: contains }] },
        select: {
          id: true,
          slug: true,
          title: true,
          originalTitle: true,
          releaseDate: true,
          synopsis: true,
          posterUrl: true,
          averageRating: true,
          runtimeMinutes: true,
          reviews: { select: { id: true } },
          genres: { select: { genre: { select: { name: true } } } },
          credits: {
            where: { role: 'DIRECTOR' },
            select: { person: { select: { fullName: true } } },
          },
        },
        orderBy: [{ averageRating: 'desc' }, { updatedAt: 'desc' }],
        take,
      }),
      this.prisma.person.findMany({
        where: { fullName: contains },
        select: { id: true, fullName: true, photoUrl: true, _count: { select: { credits: true } } },
        orderBy: { credits: { _count: 'desc' } },
        take,
      }),
      this.prisma.user.findMany({
        where: { OR: [{ username: contains }, { bio: contains }] },
        select: {
          id: true,
          username: true,
          profilePicture: true,
          bio: true,
          createdAt: true,
          _count: { select: { followers: true, following: true, reviews: true, diaryEntries: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
      }),
      this.prisma.list.findMany({
        where: { OR: [{ title: contains }, { description: contains }] },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          user: { select: { id: true, username: true, profilePicture: true } },
          _count: { select: { movies: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take,
      }),
    ]);

    return {
      movies: movies.map((movie) => ({
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        originalTitle: movie.originalTitle,
        releaseYear: movie.releaseDate?.getFullYear() ?? null,
        synopsis: movie.synopsis,
        posterUrl: movie.posterUrl,
        averageRating: movie.averageRating,
        reviewCount: movie.reviews.length,
        genres: movie.genres.map((item) => item.genre.name),
        directors: movie.credits.map((item) => item.person.fullName),
        runtimeMinutes: movie.runtimeMinutes,
      })),
      people,
      users,
      lists,
    };
  }
}
