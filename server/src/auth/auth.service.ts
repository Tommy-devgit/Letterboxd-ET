import { Injectable } from '@nestjs/common';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  describeLogin(dto: LoginDto) {
    return {
      email: dto.email,
      status: 'login-foundation-ready',
    };
  }

  describeRegistration(dto: RegisterDto) {
    return {
      email: dto.email,
      username: dto.username,
      status: 'auth-foundation-ready',
    };
  }

  describePasswordReset(dto: ForgotPasswordDto) {
    return {
      email: dto.email,
      status: 'password-reset-foundation-ready',
    };
  }
}
