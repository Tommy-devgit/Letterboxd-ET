import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IngestionService } from './services/ingestion.service';

class IngestFileDto {
  @IsString()
  filePath!: string;
}

/**
 * Admin-only ingestion trigger.
 * TODO: Protect with an admin guard / API key before exposing to production.
 */
@Controller('admin/ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('sodere')
  @HttpCode(HttpStatus.OK)
  ingestSodere(@Body() dto: IngestFileDto) {
    return this.ingestionService.ingestSodereFile(dto.filePath);
  }
}
