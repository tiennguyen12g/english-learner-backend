import { Injectable } from '@nestjs/common';
import { VocabularyMongoService } from './services/vocabulary-mongo.service';
import {
  Vocabulary_Type,
  Vocabulary_Create_Type,
  Vocabulary_Update_Type,
  Vocabulary_Query_Type,
  Vocabulary_ListResponse_Type,
} from './vocabulary.interface';

@Injectable()
export class VocabularyService {
  constructor(private readonly vocabularyMongoService: VocabularyMongoService) {}

  /**
   * Create a new vocabulary
   */
  async create(userId: string, createData: Vocabulary_Create_Type): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.create(userId, createData);
  }

  /**
   * Get vocabulary by ID
   */
  async findById(vocabularyId: string, userId: string): Promise<Vocabulary_Type | null> {
    return this.vocabularyMongoService.findById(vocabularyId, userId);
  }

  /**
   * Get vocabularies with pagination and filters
   */
  async findMany(userId: string, query: Vocabulary_Query_Type): Promise<Vocabulary_ListResponse_Type> {
    return this.vocabularyMongoService.findMany(userId, query);
  }

  /**
   * Get pinned vocabularies
   */
  async findPinned(userId: string): Promise<Vocabulary_Type[]> {
    return this.vocabularyMongoService.findPinned(userId);
  }

  /**
   * Update vocabulary
   */
  async update(
    vocabularyId: string,
    userId: string,
    updateData: Vocabulary_Update_Type,
  ): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.update(vocabularyId, userId, updateData);
  }

  /**
   * Toggle pin status
   */
  async togglePin(vocabularyId: string, userId: string): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.togglePin(vocabularyId, userId);
  }

  /**
   * Delete vocabulary
   */
  async delete(vocabularyId: string, userId: string): Promise<boolean> {
    return this.vocabularyMongoService.delete(vocabularyId, userId);
  }
}

