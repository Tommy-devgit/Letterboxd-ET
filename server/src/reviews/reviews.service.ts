import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(dto: CreateReviewDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    // One review per user per movie — upsert updates existing content
    return this.prisma.review.upsert({
      where: { userId_movieId: { userId: dto.userId, movieId: dto.movieId } },
      create: { userId: dto.userId, movieId: dto.movieId, content: dto.content },
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

    return { data: reviews, page, pageSize, total };
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
}
