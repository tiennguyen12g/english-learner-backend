import { Injectable } from '@nestjs/common';
import { GrammarExerciseMongoService } from './services/grammar-exercise-mongo.service';
import { 
  GrammarExercise_Type, 
  GrammarExercise_Create_Type, 
  GrammarExercise_Update_Type,
  GrammarExercise_Query_Type,
  GrammarExercise_ListResponse_Type,
} from './grammar.interface';

@Injectable()
export class GrammarExerciseService {
  constructor(private grammarExerciseMongoService: GrammarExerciseMongoService) {}

  async create(userId: string, data: GrammarExercise_Create_Type): Promise<GrammarExercise_Type> {
    return this.grammarExerciseMongoService.create(userId, data);
  }

  async findById(id: string, userId: string): Promise<GrammarExercise_Type | null> {
    return this.grammarExerciseMongoService.findById(id, userId);
  }

  async findMany(userId: string, query: GrammarExercise_Query_Type): Promise<GrammarExercise_ListResponse_Type> {
    return this.grammarExerciseMongoService.findMany(userId, query);
  }

  async update(id: string, userId: string, data: GrammarExercise_Update_Type): Promise<GrammarExercise_Type> {
    return this.grammarExerciseMongoService.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.grammarExerciseMongoService.delete(id, userId);
  }
}

