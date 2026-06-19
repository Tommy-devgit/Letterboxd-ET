import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { AuthTokenPayload } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  get issuer() {
    return this.config.get<string>('JWT_ISSUER') ?? 'letterboxd-et';
  }

  async validate(payload: AuthTokenPayload) {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    const user = await this.usersService.findById(payload.sub);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
    };
  }
}
