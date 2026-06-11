import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { MovieDTO } from '../dto';
import { GenreImporter } from './genre.importer';
import { PersonImporter } from './person.importer';

export interface ImportResult {
  movieId: string;
  isNew: boolean;
  updated: boolean;
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
    // Trailer items don't create Movie rows — stored as orphan sources for later linking
    if (dto.contentType === 'TRAILER') {
      return this.storeOrphanSource(dto);
    }

    // Check if this exact source has been imported before
    const existingSource = await this.prisma.movieSource.findFirst({
      where: { sourceName: dto.source.sourceName, externalId: dto.source.externalId },
      select: { id: true, movieId: true },
    });

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

      // Upsert by slug — always update enrichable fields so re-runs fill in gaps
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
          // Update any field that now has a value — lets repeated imports enrich data
          ...(dto.title && { title: dto.title }),
          ...(dto.originalTitle && { originalTitle: dto.originalTitle }),
          ...(dto.synopsis && { synopsis: dto.synopsis }),
          ...(releaseDate && { releaseDate }),
          ...(dto.runtimeMinutes && { runtimeMinutes: dto.runtimeMinutes }),
          ...(dto.posterUrl && { posterUrl: dto.posterUrl }),
          ...(dto.backdropUrl && { backdropUrl: dto.backdropUrl }),
          ...(country?.id && { countryId: country.id }),
          ...(language?.id && { languageId: language.id }),
        },
        select: { id: true },
      });

      // Sync genre relations
      if (genreMap.size > 0) {
        await tx.movieGenre.createMany({
          data: [...genreMap.values()].map((genreId) => ({ movieId: movie.id, genreId })),
          skipDuplicates: true,
        });
      }

      // Sync credit relations
      for (const creditDto of dto.credits) {
        const personId = personMap.get(creditDto.fullName);
        if (!personId) continue;

        const exists = await tx.movieCredit.findFirst({
          where: { movieId: movie.id, personId, role: creditDto.role, characterName: creditDto.characterName ?? null },
          select: { id: true },
        });
        if (!exists) {
          await tx.movieCredit.create({
            data: { movieId: movie.id, personId, role: creditDto.role, characterName: creditDto.characterName ?? null },
          });
        }
      }

      // Attach trailers from the DTO (e.g. Sodere trailer_url field)
      for (const trailer of dto.trailers) {
        const trailerExists = await tx.movieTrailer.findFirst({
          where: { movieId: movie.id, youtubeUrl: trailer.youtubeUrl },
          select: { id: true },
        });
        if (!trailerExists) {
          await tx.movieTrailer.create({
            data: { movieId: movie.id, title: trailer.title, youtubeUrl: trailer.youtubeUrl },
          });
        }
      }

      // Record the source, or link existing orphan source to this movie
      if (existingSource) {
        if (!existingSource.movieId) {
          // Was stored as orphan — link it now
          await tx.movieSource.update({
            where: { id: existingSource.id },
            data: { movieId: movie.id },
          });
        }
        this.logger.debug(`Updated: "${dto.title}" (${movie.id})`);
        return { movieId: movie.id, isNew: false, updated: true, skipped: false };
      }

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
      return { movieId: movie.id, isNew: true, updated: false, skipped: false };
    });
  }

  private async storeOrphanSource(dto: MovieDTO): Promise<ImportResult> {
    const existing = await this.prisma.movieSource.findFirst({
      where: { sourceName: dto.source.sourceName, externalId: dto.source.externalId },
      select: { id: true, movieId: true },
    });

    if (existing) {
      return { movieId: existing.movieId ?? '', isNew: false, updated: false, skipped: true };
    }

    await this.prisma.movieSource.create({
      data: {
        movieId: null,
        sourceName: dto.source.sourceName,
        externalId: dto.source.externalId,
        sourceUrl: dto.source.sourceUrl,
        scrapedData: dto.source.scrapedData as Prisma.InputJsonValue,
      },
    });

    // Newly stored orphan — not "skipped", not "imported", counted separately
    return { movieId: '', isNew: false, updated: false, skipped: false };
  }
}
