import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { DiaryModule } from './diary/diary.module';
import { HealthController } from './health.controller';
import { IngestionModule } from './ingestion/ingestion.module';
import { ListsModule } from './lists/lists.module';
import { MoviesModule } from './movies/movies.module';
import { PeopleModule } from './people/people.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ActivityModule,
    MoviesModule,
    PeopleModule,
    IngestionModule,
    ReviewsModule,
    SearchModule,
    RatingsModule,
    DiaryModule,
    ListsModule,
    WatchlistModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
