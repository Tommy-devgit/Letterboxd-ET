import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(AuthGuard)
  findRecent(@CurrentUser() user: CurrentUserType, @Query('limit') limit = 30) {
    return this.activityService.findForUser(user.id, +limit);
  }
}
