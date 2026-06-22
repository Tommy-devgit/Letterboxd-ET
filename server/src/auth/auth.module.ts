import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [ConfigModule, PrismaModule, forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService, AuthGuard, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
