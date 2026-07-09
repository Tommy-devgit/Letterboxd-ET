import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';

const refreshCookieName = 'lbxd_et_refresh';
const sessionCookieName = 'lbxd_et_session';
const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

type CookieOptions = ReturnType<typeof cookieOptions>;
type CookieResponse = {
  cookie(name: string, value: string, options: CookieOptions): void;
  clearCookie(name: string, options: CookieOptions): void;
};
type HeaderRequest = {
  headers?: {
    authorization?: string;
    cookie?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: CookieResponse) {
    const session = await this.authService.register(dto);
    this.setSessionCookies(response, session.refreshToken);
    return this.toClientSession(session);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: CookieResponse) {
    const session = await this.authService.login(dto);
    this.setSessionCookies(response, session.refreshToken);
    return this.toClientSession(session);
  }

  @Post('refresh')
  async refresh(@Req() request: HeaderRequest, @Res({ passthrough: true }) response: CookieResponse) {
    const session = await this.authService.refresh(this.getCookie(request, refreshCookieName));
    this.setSessionCookies(response, session.refreshToken);
    return this.toClientSession(session);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: CookieResponse) {
    response.clearCookie(refreshCookieName, cookieOptions(true));
    response.clearCookie(sessionCookieName, cookieOptions(false));
    return { success: true };
  }

  @Get('me')
  me(@Req() request: HeaderRequest) {
    return this.authService.me(this.getBearerToken(request));
  }

  @Post('forgot-password')
  preparePasswordReset(@Body() dto: ForgotPasswordDto) {
    return this.authService.describePasswordReset(dto);
  }

  private setSessionCookies(response: CookieResponse, refreshToken: string) {
    response.cookie(refreshCookieName, refreshToken, cookieOptions(true));
    response.cookie(sessionCookieName, '1', cookieOptions(false));
  }

  private toClientSession(session: { user: unknown; accessToken: string; expiresIn: number }) {
    return { user: session.user, accessToken: session.accessToken, expiresIn: session.expiresIn };
  }

  private getBearerToken(request: HeaderRequest) {
    const header = request.headers?.authorization as string | undefined;
    if (!header?.startsWith('Bearer ')) return undefined;
    return header.slice('Bearer '.length);
  }

  private getCookie(request: HeaderRequest, name: string) {
    const rawCookie = request.headers?.cookie as string | undefined;
    if (!rawCookie) return undefined;
    return rawCookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }
}

function cookieOptions(httpOnly: boolean) {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
    path: '/',
    maxAge: refreshMaxAgeMs,
  };
}
