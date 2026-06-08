import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [MoviesModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
