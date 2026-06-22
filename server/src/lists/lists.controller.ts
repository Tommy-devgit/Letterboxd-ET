import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { AddMovieToListDto, CreateListDto, UpdateListDto } from './dto/list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  /** POST /lists */
  @Post()
  @UseGuards(AuthGuard)
  createList(@CurrentUser() user: CurrentUserType, @Body() dto: CreateListDto) {
    return this.listsService.createList(user.id, dto);
  }

  /** GET /lists or /lists?userId=... */
  @Get()
  getLists(
    @Query('userId') userId?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 24,
  ) {
    if (userId) return this.listsService.getUserLists(userId);
    return this.listsService.getPublicLists(+page, +pageSize);
  }

  /** GET /lists/:id */
  @Get(':id')
  getList(@Param('id') id: string) {
    return this.listsService.getList(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateList(@CurrentUser() user: CurrentUserType, @Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.listsService.updateList(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteList(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.listsService.deleteList(user.id, id);
  }

  /** POST /lists/:id/movies */
  @Post(':id/movies')
  @UseGuards(AuthGuard)
  addMovie(@CurrentUser() user: CurrentUserType, @Param('id') listId: string, @Body() dto: AddMovieToListDto) {
    return this.listsService.addMovieToList(user.id, listId, dto);
  }

  /** DELETE /lists/:id/movies/:movieId */
  @Delete(':id/movies/:movieId')
  @UseGuards(AuthGuard)
  removeMovie(@CurrentUser() user: CurrentUserType, @Param('id') listId: string, @Param('movieId') movieId: string) {
    return this.listsService.removeMovieFromList(user.id, listId, movieId);
  }
}
