import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { MovieDTO } from '../dto';
import { GenreImporter } from './genre.importer';
import { PersonImporter } from './person.importer';

export interface ImportResult {
  movieId: string;
  isNew: boolean;
  skipped: boolean;
}

@Injectable()
export class MovieImporter {
  private readonly logger = new Logger(MovieImporter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly genreImporter: GenreImporter,
    private readonly personImporter: PersonImporter,
  ) {}

  async import(dto: MovieDTO): Promise<ImportResult> {
    // Trailer items don't become Movie rows — stored as orphan sources for later linking
    if (dto.contentType === 'TRAILER') {
      return this.storeOrphanSource(dto);
    }

    // Idempotency: already imported via this source?
    const existingSource = await this.prisma.movieSource.findFirst({
      where: { sourceName: dto.source.sourceName, externalId: dto.source.externalId },
      select: { movieId: true },
    });
    if (existingSource?.movieId) {
      return { movieId: existingSource.movieId, isNew: false, skipped: true };
    }

    // Pre-resolve genres and people outside the transaction (both are idempotent)
    const genreMap = await this.genreImporter.upsertMany(dto.genres);
    const personMap = await this.personImporter.upsertMany(dto.credits);

    return this.prisma.$transaction(async (tx) => {
      const [country, language] = await Promise.all([
        dto.countryCode
          ? tx.country.findFirst({ where: { code: dto.countryCode }, select: { id: true } })
          : null,
        dto.languageCode
          ? tx.language.findFirst({ where: { code: dto.languageCode }, select: { id: true } })
          : null,
      ]);

      const releaseDate = dto.releaseYear ? new Date(dto.releaseYear, 0, 1) : null;

      const movie = await tx.movie.upsert({
        where: { slug: dto.slug },
        create: {
          title: dto.title,
          originalTitle: dto.originalTitle ?? null,
          slug: dto.slug,
          synopsis: dto.synopsis ?? null,
          releaseDate,
          runtimeMinutes: dto.runtimeMinutes ?? null,
          posterUrl: dto.posterUrl ?? null,
          backdropUrl: dto.backdropUrl ?? null,
          countryId: country?.id ?? null,
          languageId: language?.id ?? null,
        },
        update: {
          // Only overwrite non-null incoming values to avoid clobbering manual edits
          ...(dto.synopsis ? { synopsis: dto.synopsis } : {}),
          ...(dto.posterUrl ? { posterUrl: dto.posterUrl } : {}),
          ...(dto.runtimeMinutes ? { runtimeMinutes: dto.runtimeMinutes } : {}),
        },
        select: { id: true },
      });

      // Sync genre relations (skip duplicates from parallel runs)
      if (genreMap.size > 0) {
        await tx.movieGenre.createMany({
          data: [...genreMap.values()].map((genreId) => ({ movieId: movie.id, genreId })),
          skipDuplicates: true,
        });
      }

      // Create credit relations — use findFirst+create because the @@unique on MovieCredit
      // includes characterName which can be NULL, making upsert unreliable in PostgreSQL
      for (const creditDto of dto.credits) {
        const personId = personMap.get(creditDto.fullName);
        if (!personId) continue;

        const exists = await tx.movieCredit.findFirst({
          where: {
            movieId: movie.id,
            personId,
            role: creditDto.role,
            characterName: creditDto.characterName ?? null,
          },
          select: { id: true },
        });

        if (!exists) {
          await tx.movieCredit.create({
            data: {
              movieId: movie.id,
              personId,
              role: creditDto.role,
              characterName: creditDto.characterName ?? null,
            },
          });
        }
      }

      // Attach YouTube trailer links supplied by the transformer
      for (const trailer of dto.trailers) {
        await tx.movieTrailer.create({
          data: { movieId: movie.id, title: trailer.title, youtubeUrl: trailer.youtubeUrl },
        });
      }

      // Record the source so re-runs skip this item
      await tx.movieSource.create({
        data: {
          movieId: movie.id,
          sourceName: dto.source.sourceName,
          externalId: dto.source.externalId,
          sourceUrl: dto.source.sourceUrl,
          scrapedData: dto.source.scrapedData as Prisma.InputJsonValue,
        },
      });

      this.logger.debug(`Imported: "${dto.title}" → ${movie.id}`);
      return { movieId: movie.id, isNew: true, skipped: false };
    });
  }

  private async storeOrphanSource(dto: MovieDTO): Promise<ImportResult> {
    const existing = await this.prisma.movieSource.findFirst({
      where: { sourceName: dto.source.sourceName, externalId: dto.source.externalId },
      select: { id: true },
    });
    if (existing) return { movieId: '', isNew: false, skipped: true };

    await this.prisma.movieSource.create({
      data: {
        movieId: null,
        sourceName: dto.source.sourceName,
        externalId: dto.source.externalId,
        sourceUrl: dto.source.sourceUrl,
        scrapedData: dto.source.scrapedData as Prisma.InputJsonValue,
      },
    });
    return { movieId: '', isNew: false, skipped: false };
  }
}
