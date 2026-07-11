import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { ChangePasswordDto, UpdateAccountDto, UpdateUserProfileDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findPublic(@Query('page') page = 1, @Query('pageSize') pageSize = 24) {
    return this.usersService.findPublic(+page, +pageSize);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard)
  follow(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.usersService.follow(user.id, id);
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard)
  unfollow(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.usersService.unfollow(user.id, id);
  }

  @Get(':id/follow-status')
  @UseGuards(AuthGuard)
  followStatus(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.usersService.followStatus(user.id, id);
  }

  @Get(':id/followers')
  followers(@Param('id') id: string, @Query('page') page = 1, @Query('pageSize') pageSize = 24) {
    return this.usersService.followers(id, +page, +pageSize);
  }

  @Get(':id/following')
  following(@Param('id') id: string, @Query('page') page = 1, @Query('pageSize') pageSize = 24) {
    return this.usersService.following(id, +page, +pageSize);
  }

  @Patch(':id/profile')
  @UseGuards(AuthGuard)
  updateProfile(@CurrentUser() user: CurrentUserType, @Param('id') id: string, @Body() dto: UpdateUserProfileDto) {
    this.assertSelf(user.id, id);
    return this.usersService.updateProfile(id, dto);
  }

  @Patch(':id/account')
  @UseGuards(AuthGuard)
  updateAccount(@CurrentUser() user: CurrentUserType, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    this.assertSelf(user.id, id);
    return this.usersService.updateAccount(id, dto);
  }

  @Patch(':id/password')
  @UseGuards(AuthGuard)
  changePassword(@CurrentUser() user: CurrentUserType, @Param('id') id: string, @Body() dto: ChangePasswordDto) {
    this.assertSelf(user.id, id);
    return this.usersService.changePassword(id, dto);
  }

  private assertSelf(authUserId: string, requestedUserId: string) {
    if (authUserId !== requestedUserId) throw new ForbiddenException('Cannot edit another user account');
  }
}
