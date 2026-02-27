import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { VocabularyService } from './vocabulary.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import { JwtUserPayload } from '../user/user.interface';
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
  Vocabulary_Create_Schema,
  Vocabulary_Update_Schema,
  Vocabulary_Query_Schema,
  Sentence_Check_Request_Schema,
} from './vocabulary.interface';

@Controller('api/v1/vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  /**
   * Create a new vocabulary
   * POST /api/v1/vocabulary
   * Requires authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: Vocabulary_Create_Schema, action: 'createVocabulary' }))
    createData: Vocabulary_Create_Type,
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () => this.vocabularyService.create(req.user.user_id, createData),
      actionName: 'createVocabulary',
    });
  }

  /**
   * Get vocabularies with pagination and filters
   * GET /api/v1/vocabulary
   * Requires authentication (user-specific)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Query(new ZodValidationPipe({ schema: Vocabulary_Query_Schema, action: 'getVocabularies' }))
    query: Vocabulary_Query_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_ListResponse_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_ListResponse_Type>({
      execute: () => this.vocabularyService.findMany(req.user.user_id, query),
      actionName: 'getVocabularies',
    });
  }

  /**
   * Get vocabulary statistics
   * GET /api/v1/vocabulary/statistics
   * Requires authentication
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Statistics_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Statistics_Type>({
      execute: () => this.vocabularyService.getStatistics(req.user.user_id),
      actionName: 'getVocabularyStatistics',
    });
  }

  /**
   * Get progress history for charts
   * GET /api/v1/vocabulary/progress-history
   * Requires authentication
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   * Using hyphen instead of slash to avoid NestJS routing issues
   */
  @Get('progress-history')
  @UseGuards(JwtAuthGuard)
  async getProgressHistory(
    @Query('days') days: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_ProgressHistory_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_ProgressHistory_Type>({
      execute: () =>
        this.vocabularyService.getProgressHistory(
          req.user.user_id,
          days ? parseInt(days, 10) : 30,
        ),
      actionName: 'getProgressHistory',
    });
  }

  /**
   * Get words for practice
   * GET /api/v1/vocabulary/practice/words
   * Requires authentication
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Get('practice/words')
  @UseGuards(JwtAuthGuard)
  async getWordsForPractice(
    @Query('limit') limit: string,
    @Query('difficulty') difficulty: string,
    @Query('reviewStatus') reviewStatus: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type[] | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type[]>({
      execute: () =>
        this.vocabularyService.getWordsForPractice(
          req.user.user_id,
          limit ? parseInt(limit, 10) : 10,
          difficulty,
          reviewStatus,
        ),
      actionName: 'getWordsForPractice',
    });
  }

  /**
   * Get related words
   * GET /api/v1/vocabulary/related/:id
   * Requires authentication
   * Using /related/:id instead of /:id/related to avoid NestJS routing conflicts
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Get('related/:id')
  @UseGuards(JwtAuthGuard)
  async getRelatedWords(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type[] | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type[]>({
      execute: () =>
        this.vocabularyService.findRelatedWords(
          id,
          req.user.user_id,
          limit ? parseInt(limit, 10) : 10,
        ),
      actionName: 'getRelatedWords',
    });
  }

  /**
   * Get pinned vocabularies
   * GET /api/v1/vocabulary/pinned/list
   * Requires authentication
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Get('pinned/list')
  @UseGuards(JwtAuthGuard)
  async findPinned(
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type[] | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type[]>({
      execute: () => this.vocabularyService.findPinned(req.user.user_id),
      actionName: 'getPinnedVocabularies',
    });
  }

  /**
   * Get vocabulary by word (URL-friendly)
   * GET /api/v1/vocabulary/word/:word
   * Requires authentication (user-specific)
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Get('word/:word')
  @UseGuards(JwtAuthGuard)
  async findByWord(
    @Param('word') word: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: async () => {
        const vocabulary = await this.vocabularyService.findByWord(word, req.user.user_id);
        if (!vocabulary) {
          throw new Error('Vocabulary not found');
        }
        return vocabulary;
      },
      actionName: 'getVocabularyByWord',
    });
  }

  /**
   * Get vocabulary by ID
   * GET /api/v1/vocabulary/:id
   * Requires authentication (user-specific)
   * NOTE: This must be LAST to avoid matching specific routes like 'statistics', 'practice/words', etc.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: async () => {
        const vocabulary = await this.vocabularyService.findById(id, req.user.user_id);
        if (!vocabulary) {
          throw new Error('Vocabulary not found');
        }
        return vocabulary;
      },
      actionName: 'getVocabulary',
    });
  }

  /**
   * Update vocabulary
   * PUT /api/v1/vocabulary/:id
   * Requires authentication (user-specific)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: Vocabulary_Update_Schema, action: 'updateVocabulary' }))
    updateData: Vocabulary_Update_Type,
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () => this.vocabularyService.update(id, req.user.user_id, updateData),
      actionName: 'updateVocabulary',
    });
  }

  /**
   * Toggle pin status
   * PATCH /api/v1/vocabulary/:id/pin
   * Requires authentication (user-specific)
   * NOTE: Must be defined BEFORE @Get(':id') to avoid route conflict
   */
  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard)
  async togglePin(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () => this.vocabularyService.togglePin(id, req.user.user_id),
      actionName: 'togglePinVocabulary',
    });
  }

  /**
   * Delete vocabulary
   * DELETE /api/v1/vocabulary/:id
   * Requires authentication (user-specific)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<{ success: boolean } | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<{ success: boolean }>({
      execute: async () => {
        await this.vocabularyService.delete(id, req.user.user_id);
        return { success: true };
      },
      actionName: 'deleteVocabulary',
    });
  }


  /**
   * Record practice result
   * POST /api/v1/vocabulary/practice/result
   * Requires authentication
   */
  @Post('practice/result')
  @UseGuards(JwtAuthGuard)
  async recordPracticeResult(
    @Body() result: Practice_Result_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () =>
        this.vocabularyService.recordPracticeResult(
          result.vocabularyId,
          req.user.user_id,
          result,
        ),
      actionName: 'recordPracticeResult',
    });
  }

  /**
   * Check sentence with AI
   * POST /api/v1/vocabulary/practice/sentence-check
   * Requires authentication
   * NOTE: Must be defined BEFORE @Post('practice/result') to avoid route conflict
   */
  @Post('practice/sentence-check')
  @UseGuards(JwtAuthGuard)
  async checkSentence(
    @Body(new ZodValidationPipe({ schema: Sentence_Check_Request_Schema, action: 'checkSentence' }))
    request: Sentence_Check_Request_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<(AI_Feedback_Type & { vocabulary: Vocabulary_Type }) | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<AI_Feedback_Type & { vocabulary: Vocabulary_Type }>({
      execute: () => this.vocabularyService.checkSentence(req.user.user_id, request),
      actionName: 'checkSentence',
    });
  }

  /**
   * Save practice sentence to vocabulary
   * POST /api/v1/vocabulary/:id/practice-sentence
   * Requires authentication
   */
  @Post(':id/practice-sentence')
  @UseGuards(JwtAuthGuard)
  async savePracticeSentence(
    @Param('id') vocabularyId: string,
    @Body() practiceSentence: {
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
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () =>
        this.vocabularyService.savePracticeSentence(
          vocabularyId,
          req.user.user_id,
          practiceSentence,
        ),
      actionName: 'savePracticeSentence',
    });
  }

  /**
   * Delete a practice sentence from vocabulary
   * DELETE /api/v1/vocabulary/:id/practice-sentence/:index
   * Requires authentication
   */
  @Delete(':id/practice-sentence/:index')
  @UseGuards(JwtAuthGuard)
  async deletePracticeSentence(
    @Param('id') vocabularyId: string,
    @Param('index') index: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<Vocabulary_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    const sentenceIndex = parseInt(index, 10);
    if (isNaN(sentenceIndex) || sentenceIndex < 0) {
      throw new Error('Invalid sentence index');
    }

    return handleRequest<Vocabulary_Type>({
      execute: () =>
        this.vocabularyService.deletePracticeSentence(
          vocabularyId,
          req.user.user_id,
          sentenceIndex,
        ),
      actionName: 'deletePracticeSentence',
    });
  }
}

