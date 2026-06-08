import { Module } from '@nestjs/common';
import { GenreImporter } from './importers/genre.importer';
import { MovieImporter } from './importers/movie.importer';
import { PersonImporter } from './importers/person.importer';
import { TrailerImporter } from './importers/trailer.importer';
import { IngestionService } from './services/ingestion.service';
import { IngestionController } from './ingestion.controller';

@Module({
  controllers: [IngestionController],
  providers: [GenreImporter, PersonImporter, MovieImporter, TrailerImporter, IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
