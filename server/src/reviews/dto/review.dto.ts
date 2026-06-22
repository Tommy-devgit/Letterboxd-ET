import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  movieId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  content!: string;
}

export class UpdateReviewDto {
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  content!: string;
}