import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class RateMovieDto {
  // TODO: Replace with @CurrentUser() from JWT guard once auth is implemented
  @IsUUID()
  userId!: string;

  /** Half-star scale: 0.5 – 5.0 */
  @IsNumber()
  @Min(0.5)
  @Max(5)
  rating!: number;
}
