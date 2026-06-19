import { Controller, Get, Query } from '@nestjs/common';
import { CreditRole } from '@prisma/client';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get('popular')
  popular(@Query('role') role?: CreditRole, @Query('take') take = 12) {
    return this.peopleService.popular(role, +take);
  }
}
