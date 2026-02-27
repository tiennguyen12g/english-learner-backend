import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GrammarNoteService } from './grammar-note.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import type { JwtUserPayload } from '../user/user.interface';
import {
  GrammarNote_Create_Schema,
  GrammarNote_Update_Schema,
  GrammarNote_Query_Schema,
  GrammarNote_Type,
  GrammarNote_ListResponse_Type,
  GrammarNote_Create_Type,
  GrammarNote_Update_Type,
  GrammarNote_Query_Type,
} from './grammar.interface';

@Controller('api/v1/grammar/notes')
export class GrammarNoteController {
  constructor(private grammarNoteService: GrammarNoteService) {}

  /**
   * Create a new grammar note
   * POST /api/v1/grammar/notes
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: GrammarNote_Create_Schema, action: 'createGrammarNote' }))
    data: GrammarNote_Create_Type,
  ): Promise<ResponseDataOutput<GrammarNote_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarNote_Type>({
      execute: () => this.grammarNoteService.create(req.user.user_id, data),
      actionName: 'createGrammarNote',
    });
  }

  /**
   * Get grammar note by ID
   * GET /api/v1/grammar/notes/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<GrammarNote_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarNote_Type>({
      execute: () => this.grammarNoteService.findById(id, req.user.user_id),
      actionName: 'getGrammarNote',
    });
  }

  /**
   * Get many grammar notes with pagination and filters
   * GET /api/v1/grammar/notes
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Query(new ZodValidationPipe({ schema: GrammarNote_Query_Schema, action: 'getGrammarNotes' }))
    query: GrammarNote_Query_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<GrammarNote_ListResponse_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarNote_ListResponse_Type>({
      execute: () => this.grammarNoteService.findMany(req.user.user_id, query),
      actionName: 'getGrammarNotes',
    });
  }

  /**
   * Update grammar note
   * PUT /api/v1/grammar/notes/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: GrammarNote_Update_Schema, action: 'updateGrammarNote' }))
    data: GrammarNote_Update_Type,
  ): Promise<ResponseDataOutput<GrammarNote_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarNote_Type>({
      execute: () => this.grammarNoteService.update(id, req.user.user_id, data),
      actionName: 'updateGrammarNote',
    });
  }

  /**
   * Delete grammar note
   * DELETE /api/v1/grammar/notes/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<void | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<void>({
      execute: () => this.grammarNoteService.delete(id, req.user.user_id),
      actionName: 'deleteGrammarNote',
    });
  }
}

