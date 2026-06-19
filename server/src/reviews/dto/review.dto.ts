import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  // userId is accepted explicitly until JWT guards are enabled.
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
  // userId is accepted explicitly until JWT guards are enabled.
  @IsUUID()
  userId!: string;
}
