import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { RateMovieDto } from './dto/rating.dto';
import { RatingsService } from './ratings.service';

@Controller('movies/:movieId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /** POST /movies/:movieId/ratings */
  @Post()
  @UseGuards(AuthGuard)
  rateMovie(@CurrentUser() user: CurrentUserType, @Param('movieId') movieId: string, @Body() dto: RateMovieDto) {
    return this.ratingsService.rateMovie(user.id, movieId, dto);
  }

  /** GET /movies/:movieId/ratings/me */
  @Get('me')
  @UseGuards(AuthGuard)
  getMyRating(@CurrentUser() user: CurrentUserType, @Param('movieId') movieId: string) {
    return this.ratingsService.getUserRating(user.id, movieId);
  }
}
