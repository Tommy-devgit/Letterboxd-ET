import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateDiaryEntryDto {
  // userId is accepted explicitly until JWT guards are enabled.
  @IsUUID()
  userId!: string;

  @IsUUID()
  movieId!: string;

  @Transform(({ value }) => new Date(value as string))
  @IsDate()
  watchedAt!: Date;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
