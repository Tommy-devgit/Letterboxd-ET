import { Transform } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const ALLOWED_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export class CreateDiaryEntryDto {
  @IsUUID()
  movieId!: string;

  @Transform(({ value }) => new Date(value as string))
  @IsDate()
  watchedAt!: Date;

  @IsOptional()
  @IsIn(ALLOWED_RATINGS)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
