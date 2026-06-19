import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(page = 1, pageSize = 24) {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count(),
    ]);

    return { data: users, page, pageSize, total };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }
}

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  profilePicture: true,
  bio: true,
  createdAt: true,
  _count: {
    select: {
      ratings: true,
      reviews: true,
      watchlist: true,
      diaryEntries: true,
      lists: true,
      followers: true,
      following: true,
    },
  },
} as const;
