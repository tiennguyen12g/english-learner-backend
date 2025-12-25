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
  Vocabulary_Create_Schema,
  Vocabulary_Update_Schema,
  Vocabulary_Query_Schema,
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
   * Get vocabulary by ID
   * GET /api/v1/vocabulary/:id
   * Requires authentication (user-specific)
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
   * Get pinned vocabularies
   * GET /api/v1/vocabulary/pinned
   * Requires authentication
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
}

