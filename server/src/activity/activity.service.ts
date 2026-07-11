import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ActivityItem = {
  id: string;
  type: 'watched' | 'rated' | 'reviewed' | 'watchlisted' | 'listed';
  createdAt: Date;
  user: { id: string; username: string; profilePicture: string | null };
  movie?: { id: string; slug: string; title: string; posterUrl: string | null };
  list?: { id: string; title: string };
  rating?: number | null;
};

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string, limit = 30) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((item) => item.followingId);
    if (!followingIds.length) return [];

    const userFilter = { userId: { in: followingIds } };
    const [diary, ratings, reviews, watchlist, lists] = await this.prisma.$transaction([
      this.prisma.diaryEntry.findMany({
        where: userFilter,
        include: {
          user: { select: publicUserSelect },
          movie: { select: activityMovieSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.rating.findMany({
        where: userFilter,
        include: {
          user: { select: publicUserSelect },
          movie: { select: activityMovieSelect },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.prisma.review.findMany({
        where: userFilter,
        include: {
          user: { select: publicUserSelect },
          movie: { select: activityMovieSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.watchlist.findMany({
        where: userFilter,
        include: {
          user: { select: publicUserSelect },
          movie: { select: activityMovieSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.list.findMany({
        where: userFilter,
        include: { user: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    const items: ActivityItem[] = [
      ...diary.map((entry) => ({
        id: `diary-${entry.id}`,
        type: 'watched' as const,
        createdAt: entry.createdAt,
        user: entry.user,
        movie: entry.movie,
        rating: entry.rating,
      })),
      ...ratings.map((rating) => ({
        id: `rating-${rating.userId}-${rating.movieId}`,
        type: 'rated' as const,
        createdAt: rating.updatedAt,
        user: rating.user,
        movie: rating.movie,
        rating: rating.rating,
      })),
      ...reviews.map((review) => ({
        id: `review-${review.id}`,
        type: 'reviewed' as const,
        createdAt: review.createdAt,
        user: review.user,
        movie: review.movie,
      })),
      ...watchlist.map((item) => ({
        id: `watchlist-${item.userId}-${item.movieId}`,
        type: 'watchlisted' as const,
        createdAt: item.createdAt,
        user: item.user,
        movie: item.movie,
      })),
      ...lists.map((list) => ({
        id: `list-${list.id}`,
        type: 'listed' as const,
        createdAt: list.createdAt,
        user: list.user,
        list: { id: list.id, title: list.title },
      })),
    ];

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
}

const publicUserSelect = {
  id: true,
  username: true,
  profilePicture: true,
} as const;

const activityMovieSelect = {
  id: true,
  slug: true,
  title: true,
  posterUrl: true,
} as const;
