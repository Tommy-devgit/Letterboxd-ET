import { Injectable, Logger } from '@nestjs/common';
import { ContentType as PrismaContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ContentType, MovieDTO } from '../dto';
import { GenreImporter } from './genre.importer';
import { PersonImporter } from './person.importer';

function toPrismaContentType(c: ContentType): PrismaContentType {
  if (c === 'SERIES') return PrismaContentType.SERIES;
  if (c === 'SHORT') return PrismaContentType.SHORT;
  if (c === 'UNKNOWN') return PrismaContentType.UNKNOWN;
  return PrismaContentType.MOVIE;
}

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

    // Cross-source match for ETMDB: find an existing movie via etmdbId/imdbId/tmdbId
    // so we enrich Sodere-imported movies instead of creating duplicates
    if (!existingSource && (dto.etmdbId || dto.imdbId || dto.tmdbId)) {
      const crossMatch = await this.findCrossSourceMatch(dto);
      if (crossMatch) {
        return this.enrichExistingMovie(crossMatch, dto);
      }
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
          etmdbId: dto.etmdbId ?? null,
          imdbId: dto.imdbId ?? null,
          tmdbId: dto.tmdbId ?? null,
          contentType: toPrismaContentType(dto.contentType),
        },
        update: {
          ...(dto.title && { title: dto.title }),
          ...(dto.originalTitle && { originalTitle: dto.originalTitle }),
          ...(dto.synopsis && { synopsis: dto.synopsis }),
          ...(releaseDate && { releaseDate }),
          ...(dto.runtimeMinutes && { runtimeMinutes: dto.runtimeMinutes }),
          ...(dto.posterUrl && { posterUrl: dto.posterUrl }),
          ...(dto.backdropUrl && { backdropUrl: dto.backdropUrl }),
          ...(country?.id && { countryId: country.id }),
          ...(language?.id && { languageId: language.id }),
          ...(dto.etmdbId && { etmdbId: dto.etmdbId }),
          ...(dto.imdbId && { imdbId: dto.imdbId }),
          ...(dto.tmdbId && { tmdbId: dto.tmdbId }),
          contentType: toPrismaContentType(dto.contentType),
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

      // Attach trailers from the DTO
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

  // ---------------------------------------------------------------------------
  // Cross-source matching: find a Prisma Movie that corresponds to this DTO
  // via ETMDB, IMDB, or TMDB IDs before falling back to slug upsert
  // ---------------------------------------------------------------------------

  private async findCrossSourceMatch(dto: MovieDTO): Promise<{ id: string } | null> {
    if (dto.etmdbId) {
      const m = await this.prisma.movie.findFirst({
        where: { etmdbId: dto.etmdbId },
        select: { id: true },
      });
      if (m) return m;
    }
    if (dto.imdbId) {
      const m = await this.prisma.movie.findFirst({
        where: { imdbId: dto.imdbId },
        select: { id: true },
      });
      if (m) return m;
    }
    if (dto.tmdbId) {
      const m = await this.prisma.movie.findFirst({
        where: { tmdbId: dto.tmdbId },
        select: { id: true },
      });
      if (m) return m;
    }
    return null;
  }

  // Enrich an existing movie (e.g. already imported from Sodere) with ETMDB metadata
  // Respects priority: ETMDB wins on title/synopsis/poster/ids; Sodere wins on runtime
  private async enrichExistingMovie(
    existing: { id: string },
    dto: MovieDTO,
  ): Promise<ImportResult> {
    const genreMap = await this.genreImporter.upsertMany(dto.genres);
    const personMap = await this.personImporter.upsertMany(dto.credits);

    await this.prisma.$transaction(async (tx) => {
      const releaseDate = dto.releaseYear ? new Date(dto.releaseYear, 0, 1) : null;

      const language = dto.languageCode
        ? await tx.language.findFirst({ where: { code: dto.languageCode }, select: { id: true } })
        : null;

      // ETMDB fields win when they have a value and the existing field is null
      await tx.movie.update({
        where: { id: existing.id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.originalTitle && { originalTitle: dto.originalTitle }),
          ...(dto.synopsis && { synopsis: dto.synopsis }),
          ...(releaseDate && { releaseDate }),
          // ETMDB runtime is always null — don't overwrite Sodere runtime
          contentType: toPrismaContentType(dto.contentType),
          ...(dto.posterUrl && { posterUrl: dto.posterUrl }),
          ...(dto.backdropUrl && { backdropUrl: dto.backdropUrl }),
          ...(language?.id && { languageId: language.id }),
          ...(dto.etmdbId && { etmdbId: dto.etmdbId }),
          ...(dto.imdbId && { imdbId: dto.imdbId }),
          ...(dto.tmdbId && { tmdbId: dto.tmdbId }),
        },
      });

      // Sync genres
      if (genreMap.size > 0) {
        await tx.movieGenre.createMany({
          data: [...genreMap.values()].map((genreId) => ({ movieId: existing.id, genreId })),
          skipDuplicates: true,
        });
      }

      // Sync credits (prefer ETMDB — directors are authoritative)
      for (const creditDto of dto.credits) {
        const personId = personMap.get(creditDto.fullName);
        if (!personId) continue;
        const exists = await tx.movieCredit.findFirst({
          where: { movieId: existing.id, personId, role: creditDto.role, characterName: creditDto.characterName ?? null },
          select: { id: true },
        });
        if (!exists) {
          await tx.movieCredit.create({
            data: { movieId: existing.id, personId, role: creditDto.role, characterName: creditDto.characterName ?? null },
          });
        }
      }

      // Merge trailers (YouTube URLs — won't collide with Sodere URLs)
      for (const trailer of dto.trailers) {
        const trailerExists = await tx.movieTrailer.findFirst({
          where: { movieId: existing.id, youtubeUrl: trailer.youtubeUrl },
          select: { id: true },
        });
        if (!trailerExists) {
          await tx.movieTrailer.create({
            data: { movieId: existing.id, title: trailer.title, youtubeUrl: trailer.youtubeUrl },
          });
        }
      }

      // Store a new ETMDB source record pointing to this movie
      const sourceExists = await tx.movieSource.findFirst({
        where: { sourceName: dto.source.sourceName, externalId: dto.source.externalId },
        select: { id: true },
      });
      if (!sourceExists) {
        await tx.movieSource.create({
          data: {
            movieId: existing.id,
            sourceName: dto.source.sourceName,
            externalId: dto.source.externalId,
            sourceUrl: dto.source.sourceUrl,
            scrapedData: dto.source.scrapedData as Prisma.InputJsonValue,
          },
        });
      }
    });

    this.logger.debug(`Cross-source enriched: "${dto.title}" → ${existing.id}`);
    return { movieId: existing.id, isNew: false, updated: true, skipped: false };
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

    return { movieId: '', isNew: false, updated: false, skipped: false };
  }
}
