import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';

type AuthenticatedRequest = {
  headers?: {
    authorization?: string;
  };
  user?: CurrentUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers?.authorization as string | undefined;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
    request.user = await this.authService.authenticateAccessToken(token);
    return true;
  }
}
