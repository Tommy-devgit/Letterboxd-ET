import { Injectable, NotFoundException } from '@nestjs/common';
import { CreditRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  async popular(role?: CreditRole, take = 12) {
    return this.prisma.person.findMany({
      where: role ? { credits: { some: { role } } } : undefined,
      select: {
        id: true,
        fullName: true,
        photoUrl: true,
        _count: { select: { credits: true } },
      },
      orderBy: { credits: { _count: 'desc' } },
      take,
    });
  }

  async list({ query, role, page = 1, pageSize = 24 }: { query?: string; role?: CreditRole; page?: number; pageSize?: number }) {
    const where = {
      AND: [
        query ? { fullName: { contains: query, mode: 'insensitive' as const } } : {},
        role ? { credits: { some: { role } } } : {},
      ],
    };
    const [people, total] = await this.prisma.$transaction([
      this.prisma.person.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          photoUrl: true,
          bio: true,
          _count: { select: { credits: true } },
        },
        orderBy: { credits: { _count: 'desc' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.person.count({ where }),
    ]);
    return { data: people, page, pageSize, total };
  }

  async detail(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        credits: {
          include: {
            movie: {
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
              },
            },
          },
          orderBy: [{ role: 'asc' }, { movie: { releaseDate: 'desc' } }],
        },
      },
    });
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }
}
