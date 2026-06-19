import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { AuthTokenPayload } from '../dto/auth.dto';

@Injectable()
export class RefreshTokenStrategy {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  get cookieName() {
    return this.config.get<string>('REFRESH_TOKEN_COOKIE') ?? 'lbxd_et_refresh';
  }

  async validate(payload: AuthTokenPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    return this.usersService.findById(payload.sub);
  }
}
