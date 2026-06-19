import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findRecent(@Query('limit') limit = 30) {
    return this.activityService.findRecent(+limit);
  }
}
