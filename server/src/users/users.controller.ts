import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findPublic(@Query('page') page = 1, @Query('pageSize') pageSize = 24) {
    return this.usersService.findPublic(+page, +pageSize);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/profile')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }
}
