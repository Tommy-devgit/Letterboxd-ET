import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { WatchlistService } from './watchlist.service';

class WatchlistAddDto {
  // userId is accepted explicitly until JWT guards are enabled.
  @IsUUID()
  userId!: string;

  @IsUUID()
  movieId!: string;
}

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  /** POST /watchlist */
  @Post()
  add(@Body() dto: WatchlistAddDto) {
    return this.watchlistService.add(dto.userId, dto.movieId);
  }

  /** DELETE /watchlist/:movieId?userId=... */
  @Delete(':movieId')
  remove(@Param('movieId') movieId: string, @Query('userId') userId: string) {
    return this.watchlistService.remove(userId, movieId);
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
