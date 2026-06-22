import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    // One review per user per movie — upsert updates existing content
    return this.prisma.review.upsert({
      where: { userId_movieId: { userId, movieId: dto.movieId } },
      create: { userId, movieId: dto.movieId, content: dto.content },
      update: { content: dto.content },
      include: {
        user: { select: { id: true, username: true, profilePicture: true } },
        _count: { select: { likes: true } },
      },
    });
  }

  async findByMovie(movieId: string, page = 1, pageSize = 20) {
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { movieId },
        include: {
          user: { select: { id: true, username: true, profilePicture: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where: { movieId } }),
    ]);

    const data = await Promise.all(
      reviews.map(async (review) => {
        const rating = await this.prisma.rating.findUnique({
          where: { userId_movieId: { userId: review.userId, movieId: review.movieId } },
          select: { rating: true },
        });

        return {
          id: review.id,
          content: review.content,
          createdAt: review.createdAt,
          user: review.user,
          rating: rating?.rating ?? null,
          likesCount: review._count.likes,
        };
      }),
    );

    return { data, page, pageSize, total };
  }

  async findRecent(page = 1, pageSize = 24) {
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        include: {
          user: { select: { id: true, username: true, profilePicture: true } },
          movie: {
            select: {
              id: true,
              slug: true,
              title: true,
              posterUrl: true,
              releaseDate: true,
            },
          },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count(),
    ]);

    const data = await Promise.all(
      reviews.map(async (review) => {
        const rating = await this.prisma.rating.findUnique({
          where: { userId_movieId: { userId: review.userId, movieId: review.movieId } },
          select: { rating: true },
        });

        return {
          id: review.id,
          content: review.content,
          createdAt: review.createdAt,
          user: review.user,
          movie: {
            id: review.movie.id,
            slug: review.movie.slug,
            title: review.movie.title,
            posterUrl: review.movie.posterUrl,
            releaseYear: review.movie.releaseDate?.getFullYear() ?? null,
          },
          rating: rating?.rating ?? null,
          likesCount: review._count.likes,
        };
      }),
    );

    return { data, page, pageSize, total };
  }

  async likeReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    const existing = await this.prisma.reviewLike.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });
    if (existing) throw new ConflictException('Already liked');

    await this.prisma.reviewLike.create({ data: { userId, reviewId } });
    return { success: true };
  }

  async unlikeReview(reviewId: string, userId: string) {
    await this.prisma.reviewLike.deleteMany({ where: { userId, reviewId } });
    return { success: true };
  }

  async updateReview(reviewId: string, userId: string, content: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId }, select: { userId: true } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Cannot edit another user review');
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { content },
      include: {
        user: { select: { id: true, username: true, profilePicture: true } },
        _count: { select: { likes: true } },
      },
    });
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId }, select: { userId: true } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Cannot delete another user review');
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  }
}
