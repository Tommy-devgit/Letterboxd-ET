import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { AddMovieToListDto, CreateListDto } from './dto/list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  /** POST /lists */
  @Post()
  createList(@Body() dto: CreateListDto) {
    return this.listsService.createList(dto);
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

  /** POST /lists/:id/movies */
  @Post(':id/movies')
  addMovie(@Param('id') listId: string, @Body() dto: AddMovieToListDto) {
    return this.listsService.addMovieToList(listId, dto);
  }

  /** DELETE /lists/:id/movies/:movieId */
  @Delete(':id/movies/:movieId')
  removeMovie(@Param('id') listId: string, @Param('movieId') movieId: string) {
    return this.listsService.removeMovieFromList(listId, movieId);
  }
}
