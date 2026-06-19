import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/prepare')
  prepareLogin(@Body() dto: LoginDto) {
    return this.authService.describeLogin(dto);
  }

  @Post('register/prepare')
  prepareRegistration(@Body() dto: RegisterDto) {
    return this.authService.describeRegistration(dto);
  }

  @Post('forgot-password/prepare')
  preparePasswordReset(@Body() dto: ForgotPasswordDto) {
    return this.authService.describePasswordReset(dto);
  }
}
