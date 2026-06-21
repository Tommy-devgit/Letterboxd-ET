import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, AuthTokenPayload } from './dto/auth.dto';

const scrypt = promisify(scryptCallback);
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

type TokenKind = 'access' | 'refresh';
type JwtPayload = AuthTokenPayload & { typ: TokenKind; iat: number; exp: number; iss: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new ConflictException('Email or username is already registered');

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash: await this.hashPassword(dto.password),
      },
      select: authUserSelect,
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
    });
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const payload = this.verifyToken(refreshToken, 'refresh');
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: authUserSelect });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return this.createSession(user);
  }

  async me(accessToken: string | undefined) {
    if (!accessToken) throw new UnauthorizedException('Missing access token');
    const payload = this.verifyToken(accessToken, 'access');
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
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) throw new UnauthorizedException('Invalid token');
    const expected = this.sign(`${encodedHeader}.${encodedPayload}`);
    const received = Buffer.from(signature);
    const signed = Buffer.from(expected);
    if (received.length !== signed.length || !timingSafeEqual(received, signed)) {
      throw new UnauthorizedException('Invalid token signature');
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload;
    if (payload.typ !== expectedType || payload.iss !== this.issuer || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Expired or invalid token');
    }
    return payload;
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private get secret() {
    return this.config.get<string>('JWT_SECRET') ?? 'letterboxd-et-dev-secret-change-me';
  }

  private get issuer() {
    return this.config.get<string>('JWT_ISSUER') ?? 'letterboxd-et';
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