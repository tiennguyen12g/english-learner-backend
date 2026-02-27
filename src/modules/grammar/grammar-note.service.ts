import { Injectable } from '@nestjs/common';
import { GrammarNoteMongoService } from './services/grammar-note-mongo.service';
import { 
  GrammarNote_Type, 
  GrammarNote_Create_Type, 
  GrammarNote_Update_Type,
  GrammarNote_Query_Type,
  GrammarNote_ListResponse_Type,
} from './grammar.interface';

@Injectable()
export class GrammarNoteService {
  constructor(private grammarNoteMongoService: GrammarNoteMongoService) {}

  async create(userId: string, data: GrammarNote_Create_Type): Promise<GrammarNote_Type> {
    return this.grammarNoteMongoService.create(userId, data);
  }

  async findById(id: string, userId: string): Promise<GrammarNote_Type | null> {
    return this.grammarNoteMongoService.findById(id, userId);
  }

  async findMany(userId: string, query: GrammarNote_Query_Type): Promise<GrammarNote_ListResponse_Type> {
    return this.grammarNoteMongoService.findMany(userId, query);
  }

  async update(id: string, userId: string, data: GrammarNote_Update_Type): Promise<GrammarNote_Type> {
    return this.grammarNoteMongoService.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.grammarNoteMongoService.delete(id, userId);
  }
}

