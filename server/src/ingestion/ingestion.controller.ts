import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IngestionService } from './services/ingestion.service';
import { EtmdbIngestionService } from './services/etmdb-ingestion.service';

class IngestFileDto {
  @IsString()
  filePath!: string;
}

class IngestEtmdbDto {
  @IsString()
  databasePath!: string;
}

/**
 * Admin-only ingestion triggers.
 * TODO: Protect with an admin guard / API key before exposing to production.
 */
@Controller('admin/ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly etmdbIngestionService: EtmdbIngestionService,
  ) {}

  @Post('sodere')
  @HttpCode(HttpStatus.OK)
  ingestSodere(@Body() dto: IngestFileDto) {
    return this.ingestionService.ingestSodereFile(dto.filePath);
  }

  @Post('etmdb')
  @HttpCode(HttpStatus.OK)
  ingestEtmdb(@Body() dto: IngestEtmdbDto) {
    return this.etmdbIngestionService.ingestDatabase(dto.databasePath);
  }
}
