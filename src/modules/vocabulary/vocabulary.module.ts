import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vocabulary, VocabularySchema } from './vocabulary.schema';
import { VocabularyService } from './vocabulary.service';
import { VocabularyMongoService } from './services/vocabulary-mongo.service';
import { VocabularyController } from './vocabulary.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vocabulary.name, schema: VocabularySchema },
    ]),
  ],
  providers: [VocabularyService, VocabularyMongoService],
  controllers: [VocabularyController],
  exports: [VocabularyService, VocabularyMongoService, MongooseModule],
})
export class VocabularyModule {}

