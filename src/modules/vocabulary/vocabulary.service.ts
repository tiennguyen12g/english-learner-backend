import { Injectable, BadRequestException } from '@nestjs/common';
import { VocabularyMongoService } from './services/vocabulary-mongo.service';
import { AIFeedbackService } from './services/ai-feedback.service';
import { UserService } from '../user/user.service';
import {
  Vocabulary_Type,
  Vocabulary_Create_Type,
  Vocabulary_Update_Type,
  Vocabulary_Query_Type,
  Vocabulary_ListResponse_Type,
  Vocabulary_Statistics_Type,
  Vocabulary_ProgressHistory_Type,
  Practice_Result_Type,
  Sentence_Check_Request_Type,
  AI_Feedback_Type,
} from './vocabulary.interface';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly vocabularyMongoService: VocabularyMongoService,
    private readonly aiFeedbackService: AIFeedbackService,
    private readonly userService: UserService,
  ) {}

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
   * Get vocabulary by word (URL-friendly format)
   */
  async findByWord(word: string, userId: string): Promise<Vocabulary_Type | null> {
    return this.vocabularyMongoService.findByWord(word, userId);
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

  /**
   * Get statistics for user's vocabulary
   */
  async getStatistics(userId: string): Promise<Vocabulary_Statistics_Type> {
    return this.vocabularyMongoService.getStatistics(userId);
  }

  /**
   * Record practice result
   */
  async recordPracticeResult(
    vocabularyId: string,
    userId: string,
    result: Practice_Result_Type,
  ): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.recordPracticeResult(vocabularyId, userId, result);
  }

  /**
   * Get words for practice
   */
  async getWordsForPractice(
    userId: string,
    limit: number = 10,
    difficulty?: string,
    reviewStatus?: string,
  ): Promise<Vocabulary_Type[]> {
    return this.vocabularyMongoService.getWordsForPractice(userId, limit, difficulty, reviewStatus);
  }

  /**
   * Get related words
   */
  async findRelatedWords(
    vocabularyId: string,
    userId: string,
    limit: number = 10,
  ): Promise<Vocabulary_Type[]> {
    return this.vocabularyMongoService.findRelatedWords(vocabularyId, userId, limit);
  }

  /**
   * Get progress history for charts
   */
  async getProgressHistory(
    userId: string,
    days: number = 30,
  ): Promise<Vocabulary_ProgressHistory_Type> {
    return this.vocabularyMongoService.getProgressHistory(userId, days);
  }

  /**
   * Check sentence with AI and return feedback
   */
  async checkSentence(
    userId: string,
    request: Sentence_Check_Request_Type,
  ): Promise<AI_Feedback_Type & { vocabulary: Vocabulary_Type }> {
    // Get vocabulary word
    const vocabulary = await this.vocabularyMongoService.findById(request.vocabularyId, userId);
    if (!vocabulary) {
      throw new BadRequestException('Vocabulary not found');
    }

    // Get user's API key for the provider
    const encryptedApiKey = await this.userService.getDecryptedAPIKey(userId, request.provider);
    if (!encryptedApiKey) {
      throw new BadRequestException(`No ${request.provider} API key found. Please add your API key in Profile settings.`);
    }

    // Get AI feedback
    let aiFeedback: AI_Feedback_Type;
    if (request.provider === 'openai') {
      aiFeedback = await this.aiFeedbackService.getOpenAIFeedback(
        encryptedApiKey,
        vocabulary.word,
        request.sentence,
      );
    } else {
      aiFeedback = await this.aiFeedbackService.getGeminiFeedback(
        encryptedApiKey,
        vocabulary.word,
        request.sentence,
      );
    }

    // Auto-mark based on threshold if provided
    const threshold = request.autoMarkThreshold ?? 80;
    if (aiFeedback.grammarScore >= threshold) {
      aiFeedback.isCorrect = true;
    }

    // Update last used timestamp
    await this.userService.updateAIProviderLastUsed(userId, request.provider);

    return {
      ...aiFeedback,
      vocabulary,
    };
  }

  /**
   * Save practice sentence to vocabulary
   */
  async savePracticeSentence(
    vocabularyId: string,
    userId: string,
    practiceSentence: {
      sentence: string;
      correctedSentence?: string;
      grammarScore: number;
      feedback: {
        grammar: string[];
        spelling: string[];
        structure: string[];
        improvements: string[];
      };
      suggestions: string[];
      exampleSentence?: string;
      provider: 'openai' | 'gemini';
      isCorrect?: boolean;
    },
  ): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.addPracticeSentence(vocabularyId, userId, practiceSentence);
  }

  /**
   * Delete a practice sentence from vocabulary
   */
  async deletePracticeSentence(
    vocabularyId: string,
    userId: string,
    sentenceIndex: number,
  ): Promise<Vocabulary_Type> {
    return this.vocabularyMongoService.deletePracticeSentence(vocabularyId, userId, sentenceIndex);
  }
}

