import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 32)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(0, 280)
  bio?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
