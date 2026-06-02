import { Controller, Get, Query } from "@nestjs/common";
import { MovieQueryDto } from "./dto/movie-query.dto";
import { MoviesService } from "./movies.service";

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findMany(@Query() query: MovieQueryDto) {
    return this.moviesService.findMany(query);
  }

  @Get("featured")
  featured() {
    return this.moviesService.featured();
  }
}
