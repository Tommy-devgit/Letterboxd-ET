import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(2, 128)
  identifier?: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export class RegisterDto {
  @IsString()
  @Length(2, 32)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ChangePasswordDto {
  @IsString()
  @Length(8, 128)
  currentPassword!: string;

  @IsString()
  @Length(8, 128)
  newPassword!: string;
}

export type AuthTokenPayload = {
  sub: string;
  email: string;
  username: string;
  tokenVersion?: number;
};
