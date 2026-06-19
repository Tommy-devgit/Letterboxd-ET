import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMovieToListDto, CreateListDto } from './dto/list.dto';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async createList(dto: CreateListDto) {
    return this.prisma.list.create({
      data: { userId: dto.userId, title: dto.title, description: dto.description ?? null },
      include: { _count: { select: { movies: true } } },
    });
  }

  async getList(listId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        user: { select: { id: true, username: true } },
        movies: {
          include: {
            movie: {
              select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!list) throw new NotFoundException('List not found');
    return list;
  }

  async getUserLists(userId: string) {
    return this.prisma.list.findMany({
      where: { userId },
      include: { _count: { select: { movies: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPublicLists(page = 1, pageSize = 24) {
    const [lists, total] = await this.prisma.$transaction([
      this.prisma.list.findMany({
        include: {
          user: { select: { id: true, username: true, profilePicture: true } },
          movies: {
            include: {
              movie: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  posterUrl: true,
                  releaseDate: true,
                  averageRating: true,
                },
              },
            },
            orderBy: { position: 'asc' },
            take: 5,
          },
          _count: { select: { movies: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.list.count(),
    ]);

    return { data: lists, page, pageSize, total };
  }

  async addMovieToList(listId: string, dto: AddMovieToListDto) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true, _count: { select: { movies: true } } },
    });
    if (!list) throw new NotFoundException('List not found');

    const position = dto.position ?? list._count.movies;

    return this.prisma.listMovie.upsert({
      where: { listId_movieId: { listId, movieId: dto.movieId } },
      create: { listId, movieId: dto.movieId, position },
      update: { position },
    });
  }

  async removeMovieFromList(listId: string, movieId: string) {
    await this.prisma.listMovie.deleteMany({ where: { listId, movieId } });
    return { success: true };
  }
}
