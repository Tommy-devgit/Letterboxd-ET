import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RateMovieDto } from './dto/rating.dto';
import { RatingsService } from './ratings.service';

@Controller('movies/:movieId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /** POST /movies/:movieId/ratings */
  @Post()
  rateMovie(@Param('movieId') movieId: string, @Body() dto: RateMovieDto) {
    return this.ratingsService.rateMovie(movieId, dto);
  }

  /** GET /movies/:movieId/ratings/me?userId=... */
  @Get('me')
  getMyRating(@Param('movieId') movieId: string, @Query('userId') userId: string) {
    return this.ratingsService.getUserRating(userId, movieId);
  }
}
