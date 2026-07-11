import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateAccountDto, UpdateUserProfileDto } from './dto/user.dto';

const scrypt = promisify(scryptCallback);

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

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        ...publicUserSelect,
        favoriteMovies: {
          include: {
            movie: {
              select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true, averageRating: true },
            },
          },
          orderBy: { position: 'asc' },
          take: 4,
        },
        reviews: {
          include: {
            movie: { select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true, runtimeMinutes: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        ratings: {
          select: { rating: true, updatedAt: true, movie: { select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 24,
        },
        diaryEntries: {
          include: {
            movie: { select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true, averageRating: true, runtimeMinutes: true } },
          },
          orderBy: { watchedAt: 'desc' },
          take: 12,
        },
        lists: {
          include: { _count: { select: { movies: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 12,
        },
        watchlist: {
          include: {
            movie: { select: { id: true, slug: true, title: true, posterUrl: true, releaseDate: true, averageRating: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('You cannot follow yourself');
    await this.ensureUser(followingId);
    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });
    return this.followStatus(followerId, followingId);
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({ where: { followerId, followingId } });
    return this.followStatus(followerId, followingId);
  }

  async followStatus(followerId: string, followingId: string) {
    const [follow, followers, following] = await this.prisma.$transaction([
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } }),
      this.prisma.follow.count({ where: { followingId } }),
      this.prisma.follow.count({ where: { followerId: followingId } }),
    ]);
    return { following: Boolean(follow), followers, followingCount: following };
  }

  async followers(userId: string, page = 1, pageSize = 24) {
    await this.ensureUser(userId);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        select: { createdAt: true, follower: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);
    return { data: rows.map((row) => ({ ...row.follower, followedAt: row.createdAt })), page, pageSize, total };
  }

  async following(userId: string, page = 1, pageSize = 24) {
    await this.ensureUser(userId);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { createdAt: true, following: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { data: rows.map((row) => ({ ...row.following, followedAt: row.createdAt })), page, pageSize, total };
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }

  async updateAccount(id: string, dto: UpdateAccountDto) {
    const data: UpdateAccountDto = {};
    if (dto.username) data.username = dto.username.trim().toLowerCase();
    if (dto.email) data.email = dto.email.trim().toLowerCase();

    if (data.username || data.email) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            data.username ? { username: data.username } : {},
            data.email ? { email: data.email } : {},
          ],
        },
        select: { id: true },
      });
      if (conflict) throw new ConflictException('Username or email is already in use');
    }

    return this.prisma.user.update({ where: { id }, data, select: publicUserSelect });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (!(await this.verifyPassword(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await this.hashPassword(dto.newPassword) },
    });
    return { success: true };
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [scheme, salt, hash] = storedHash.split(':');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hash, 'hex');
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
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
