import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vocabulary, VocabularySchema } from './vocabulary.schema';
import { VocabularyService } from './vocabulary.service';
import { VocabularyMongoService } from './services/vocabulary-mongo.service';
import { VocabularyController } from './vocabulary.controller';
import { AIFeedbackService } from './services/ai-feedback.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vocabulary.name, schema: VocabularySchema },
    ]),
    UserModule, // Import UserModule to access UserService
  ],
  providers: [VocabularyService, VocabularyMongoService, AIFeedbackService],
  controllers: [VocabularyController],
  exports: [VocabularyService, VocabularyMongoService, MongooseModule],
})
export class VocabularyModule {}

