import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  // TODO: Replace with @CurrentUser() from JWT guard once auth is implemented
  @IsUUID()
  userId!: string;

  @IsUUID()
  movieId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  content!: string;
}

export class LikeReviewDto {
  // TODO: Replace with @CurrentUser() from JWT guard once auth is implemented
  @IsUUID()
  userId!: string;
}
