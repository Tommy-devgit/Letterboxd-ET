import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export class CreateListDto {
  // userId is accepted explicitly until JWT guards are enabled.
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class AddMovieToListDto {
  @IsUUID()
  movieId!: string;

  /** Explicit ordering position. Defaults to end of list when omitted. */
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
