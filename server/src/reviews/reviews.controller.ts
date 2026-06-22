import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
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
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user.id, dto);
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
  @UseGuards(AuthGuard)
  like(@CurrentUser() user: CurrentUserType, @Param('id') reviewId: string) {
    return this.reviewsService.likeReview(reviewId, user.id);
  }

  /** DELETE /reviews/:id/likes */
  @Delete('reviews/:id/likes')
  @UseGuards(AuthGuard)
  unlike(@CurrentUser() user: CurrentUserType, @Param('id') reviewId: string) {
    return this.reviewsService.unlikeReview(reviewId, user.id);
  }

  @Patch('reviews/:id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: CurrentUserType, @Param('id') reviewId: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateReview(reviewId, user.id, dto.content);
  }

  @Delete('reviews/:id')
  @UseGuards(AuthGuard)
  delete(@CurrentUser() user: CurrentUserType, @Param('id') reviewId: string) {
    return this.reviewsService.deleteReview(reviewId, user.id);
  }
}
