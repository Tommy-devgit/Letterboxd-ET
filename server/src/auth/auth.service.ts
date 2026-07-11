import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, AuthTokenPayload } from './dto/auth.dto';

const scrypt = promisify(scryptCallback);
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

type TokenKind = 'access' | 'refresh';
type JwtPayload = AuthTokenPayload & { typ: TokenKind; iat: number; exp: number; iss: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    this.logger.log(`Register attempt email=${email} username=${username} jwtSecretConfigured=${Boolean(this.config.get<string>('JWT_SECRET'))}`);
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new ConflictException('Email or username is already registered');

    const passwordHash = await this.hashPassword(dto.password);
    this.logger.debug(`Register password hash generated email=${email} scheme=${this.hashScheme(passwordHash)}`);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
      select: authUserSelect,
    });

    const session = this.createSession(user);
    this.logger.log(`Register session created userId=${user.id} accessTokenIssued=${Boolean(session.accessToken)} refreshTokenIssued=${Boolean(session.refreshToken)}`);
    return session;
  }

  async login(dto: LoginDto) {
    const identifier = (dto.identifier ?? dto.email ?? '').trim().toLowerCase();
    if (!identifier) throw new UnauthorizedException('Invalid email/username or password');
    this.logger.log(`Login attempt identifier=${identifier} jwtSecretConfigured=${Boolean(this.config.get<string>('JWT_SECRET'))}`);
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    this.logger.log(`Login lookup identifier=${identifier} userFound=${Boolean(user)} hashScheme=${user ? this.hashScheme(user.passwordHash) : 'none'}`);
    const passwordValid = user ? await this.verifyPassword(dto.password, user.passwordHash) : false;
    this.logger.log(`Login password comparison identifier=${identifier} valid=${passwordValid}`);
    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const session = this.createSession({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
    });
    this.logger.log(`Login session created userId=${user.id} accessTokenIssued=${Boolean(session.accessToken)} refreshTokenIssued=${Boolean(session.refreshToken)}`);
    return session;
  }

  async refresh(refreshToken: string | undefined) {
    this.logger.log(`Refresh attempt tokenReceived=${Boolean(refreshToken)} jwtSecretConfigured=${Boolean(this.config.get<string>('JWT_SECRET'))}`);
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const payload = this.verifyToken(refreshToken, 'refresh');
    this.logger.log(`Refresh token verified userId=${payload.sub}`);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: authUserSelect });
    if (!user) throw new UnauthorizedException('User no longer exists');
    const session = this.createSession(user);
    this.logger.log(`Refresh session created userId=${user.id}`);
    return session;
  }

  async me(accessToken: string | undefined) {
    this.logger.log(`Me attempt tokenReceived=${Boolean(accessToken)} jwtSecretConfigured=${Boolean(this.config.get<string>('JWT_SECRET'))}`);
    if (!accessToken) throw new UnauthorizedException('Missing access token');
    const payload = this.verifyToken(accessToken, 'access');
    return this.userFromAccessPayload(payload);
  }

  async authenticateAccessToken(accessToken: string | undefined) {
    if (!accessToken) throw new UnauthorizedException('Missing access token');
    const payload = this.verifyToken(accessToken, 'access');
    return this.userFromAccessPayload(payload);
  }

  private async userFromAccessPayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: authUserSelect });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }

  describePasswordReset(dto: ForgotPasswordDto) {
    return {
      email: dto.email.trim().toLowerCase(),
      status: 'password-reset-request-accepted',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (!(await this.verifyPassword(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hashPassword(dto.newPassword) },
    });
    return { success: true, message: 'Password updated successfully' };
  }

  private createSession(user: AuthUser) {
    const payload: AuthTokenPayload = { sub: user.id, email: user.email, username: user.username };
    return {
      user,
      accessToken: this.signToken(payload, 'access', ACCESS_TTL_SECONDS),
      refreshToken: this.signToken(payload, 'refresh', REFRESH_TTL_SECONDS),
      expiresIn: ACCESS_TTL_SECONDS,
    };
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [scheme, salt, hash] = storedHash.split(':');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hash, 'hex');
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  private signToken(payload: AuthTokenPayload, typ: TokenKind, ttlSeconds: number) {
    const now = Math.floor(Date.now() / 1000);
    const body: JwtPayload = {
      ...payload,
      typ,
      iat: now,
      exp: now + ttlSeconds,
      iss: this.issuer,
    };
    const encodedHeader = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = base64Url(JSON.stringify(body));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string, expectedType: TokenKind): JwtPayload {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      if (!encodedHeader || !encodedPayload || !signature) throw new UnauthorizedException('Invalid token');
      const expected = this.sign(`${encodedHeader}.${encodedPayload}`);
      const received = Buffer.from(signature);
      const signed = Buffer.from(expected);
      if (received.length !== signed.length || !timingSafeEqual(received, signed)) {
        this.logger.warn(`JWT verification failed reason=signature expectedType=${expectedType}`);
        throw new UnauthorizedException('Invalid token signature');
      }
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload;
      if (payload.typ !== expectedType || payload.iss !== this.issuer || payload.exp < Math.floor(Date.now() / 1000)) {
        this.logger.warn(`JWT verification failed reason=claims expectedType=${expectedType} receivedType=${payload.typ} issuer=${payload.iss}`);
        throw new UnauthorizedException('Expired or invalid token');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`JWT verification failed reason=parse expectedType=${expectedType}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private get secret() {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production');
    }
    return secret ?? 'letterboxd-et-dev-secret-change-me';
  }

  private get issuer() {
    return this.config.get<string>('JWT_ISSUER') ?? 'letterboxd-et';
  }

  private hashScheme(storedHash: string | null | undefined) {
    return storedHash?.split(':')[0] || 'missing';
  }
}

function base64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

const authUserSelect = {
  id: true,
  username: true,
  email: true,
  profilePicture: true,
  bio: true,
} as const;

type AuthUser = {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
};
