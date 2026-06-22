import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module';
import { AuthModule } from '../auth/auth.module';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [AuthModule, MoviesModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
