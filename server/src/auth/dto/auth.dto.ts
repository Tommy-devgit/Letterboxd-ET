import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

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

export type AuthTokenPayload = {
  sub: string;
  email: string;
  username: string;
  tokenVersion?: number;
};
