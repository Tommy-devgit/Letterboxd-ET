import { IsIn } from 'class-validator';

export const ALLOWED_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export class RateMovieDto {
  @IsIn(ALLOWED_RATINGS)
  rating!: number;
}