import { Injectable } from '@nestjs/common';
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
}
