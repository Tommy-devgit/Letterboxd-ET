import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PersonDTO } from '../dto';

@Injectable()
export class PersonImporter {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find-or-create each person by fullName.
   * Note: Person.fullName has no @unique constraint in the schema, so we use
   * findFirst + conditional create rather than upsert.
   * Returns a map of fullName → id.
   */
  async upsertMany(people: PersonDTO[]): Promise<Map<string, string>> {
    const personMap = new Map<string, string>();

    for (const dto of people) {
      const existing = await this.prisma.person.findFirst({
        where: { fullName: dto.fullName },
        select: { id: true },
      });

      if (existing) {
        personMap.set(dto.fullName, existing.id);
        continue;
      }

      const created = await this.prisma.person.create({
        data: { fullName: dto.fullName, photoUrl: dto.photoUrl ?? null },
        select: { id: true },
      });
      personMap.set(dto.fullName, created.id);
    }

    return personMap;
  }
}
