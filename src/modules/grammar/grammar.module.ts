import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrammarNote, GrammarNoteSchema } from './grammar-note.schema';
import { GrammarExercise, GrammarExerciseSchema } from './grammar-exercise.schema';
import { GrammarNoteController } from './grammar-note.controller';
import { GrammarExerciseController } from './grammar-exercise.controller';
import { GrammarNoteService } from './grammar-note.service';
import { GrammarExerciseService } from './grammar-exercise.service';
import { GrammarNoteMongoService } from './services/grammar-note-mongo.service';
import { GrammarExerciseMongoService } from './services/grammar-exercise-mongo.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GrammarNote.name, schema: GrammarNoteSchema },
      { name: GrammarExercise.name, schema: GrammarExerciseSchema },
    ]),
    AuthModule, // Import AuthModule to use JwtAuthGuard
  ],
  controllers: [GrammarNoteController, GrammarExerciseController],
  providers: [
    GrammarNoteService,
    GrammarExerciseService,
    GrammarNoteMongoService,
    GrammarExerciseMongoService,
  ],
  exports: [GrammarNoteService, GrammarExerciseService],
})
export class GrammarModule {}

