import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto } from './dto/diary.dto';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  /** POST /diary */
  @Post()
  @UseGuards(AuthGuard)
  addEntry(@CurrentUser() user: CurrentUserType, @Body() dto: CreateDiaryEntryDto) {
    return this.diaryService.addEntry(user.id, dto);
  }

  /** GET /diary?userId=...&page=1&pageSize=20 */
  @Get()
  getEntries(
    @Query('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.diaryService.getEntries(userId, +page, +pageSize);
  }
}
