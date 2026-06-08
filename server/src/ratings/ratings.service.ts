import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { RateMovieDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moviesService: MoviesService,
  ) {}

  async rateMovie(movieId: string, dto: RateMovieDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    const rating = await this.prisma.rating.upsert({
      where: { userId_movieId: { userId: dto.userId, movieId } },
      create: { userId: dto.userId, movieId, rating: dto.rating },
      update: { rating: dto.rating },
      select: { rating: true, createdAt: true, updatedAt: true },
    });

    // Keep the denormalized Movie stats in sync after every write
    await this.moviesService.recomputeStats(movieId);

    return rating;
  }

  async getUserRating(userId: string, movieId: string) {
    return this.prisma.rating.findUnique({
      where: { userId_movieId: { userId, movieId } },
      select: { rating: true, updatedAt: true },
    });
  }
}
