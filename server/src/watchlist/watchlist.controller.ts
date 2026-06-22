import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { WatchlistService } from './watchlist.service';

class WatchlistAddDto {
  @IsUUID()
  movieId!: string;
}

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  /** POST /watchlist */
  @Post()
  @UseGuards(AuthGuard)
  add(@CurrentUser() user: CurrentUserType, @Body() dto: WatchlistAddDto) {
    return this.watchlistService.add(user.id, dto.movieId);
  }

  /** DELETE /watchlist/:movieId */
  @Delete(':movieId')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: CurrentUserType, @Param('movieId') movieId: string) {
    return this.watchlistService.remove(user.id, movieId);
  }

  /** GET /watchlist?userId=...&page=1&pageSize=20 */
  @Get()
  getWatchlist(
    @Query('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.watchlistService.getWatchlist(userId, +page, +pageSize);
  }
}
