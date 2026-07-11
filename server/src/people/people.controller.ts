import { Controller, Get, Param, Query } from '@nestjs/common';
import { CreditRole } from '@prisma/client';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get('popular')
  popular(@Query('role') role?: CreditRole, @Query('take') take = 12) {
    return this.peopleService.popular(role, +take);
  }

  @Get()
  list(
    @Query('query') query?: string,
    @Query('role') role?: CreditRole,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 24,
  ) {
    return this.peopleService.list({ query, role, page: +page, pageSize: +pageSize });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.peopleService.detail(id);
  }
}
