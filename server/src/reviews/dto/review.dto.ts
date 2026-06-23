import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsUUID()
  movieId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  content!: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  content!: string;
}

export class LikeReviewDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
