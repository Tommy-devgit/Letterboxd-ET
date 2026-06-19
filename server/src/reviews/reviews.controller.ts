import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CreateReviewDto, LikeReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** GET /reviews */
  @Get('reviews')
  findRecent(@Query('page') page = 1, @Query('pageSize') pageSize = 24) {
    return this.reviewsService.findRecent(+page, +pageSize);
  }

  /** POST /reviews */
  @Post('reviews')
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  /** GET /movies/:movieId/reviews */
  @Get('movies/:movieId/reviews')
  findByMovie(
    @Param('movieId') movieId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.reviewsService.findByMovie(movieId, +page, +pageSize);
  }

  /** POST /reviews/:id/likes */
  @Post('reviews/:id/likes')
  like(@Param('id') reviewId: string, @Body() dto: LikeReviewDto) {
    return this.reviewsService.likeReview(reviewId, dto.userId);
  }

  /** DELETE /reviews/:id/likes */
  @Delete('reviews/:id/likes')
  unlike(@Param('id') reviewId: string, @Body() dto: LikeReviewDto) {
    return this.reviewsService.unlikeReview(reviewId, dto.userId);
  }
}
