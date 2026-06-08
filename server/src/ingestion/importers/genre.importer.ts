import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GenreImporter {
  constructor(private readonly prisma: PrismaService) {}

  /** Upsert each genre by name. Returns a map of name → id. */
  async upsertMany(names: string[]): Promise<Map<string, string>> {
    const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    const genreMap = new Map<string, string>();

    await Promise.all(
      unique.map(async (name) => {
        const genre = await this.prisma.genre.upsert({
          where: { name },
          create: { name },
          update: {},
          select: { id: true, name: true },
        });
        genreMap.set(name, genre.id);
      }),
    );

    return genreMap;
  }
}
