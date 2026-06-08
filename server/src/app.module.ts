import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiaryModule } from './diary/diary.module';
import { HealthController } from './health.controller';
import { IngestionModule } from './ingestion/ingestion.module';
import { ListsModule } from './lists/lists.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MoviesModule,
    IngestionModule,
    ReviewsModule,
    RatingsModule,
    DiaryModule,
    ListsModule,
    WatchlistModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
