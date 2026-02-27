import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GrammarExerciseService } from './grammar-exercise.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import type { JwtUserPayload } from '../user/user.interface';
import {
  GrammarExercise_Create_Schema,
  GrammarExercise_Update_Schema,
  GrammarExercise_Query_Schema,
  GrammarExercise_Type,
  GrammarExercise_ListResponse_Type,
  GrammarExercise_Create_Type,
  GrammarExercise_Update_Type,
  GrammarExercise_Query_Type,
} from './grammar.interface';

@Controller('api/v1/grammar/exercises')
export class GrammarExerciseController {
  constructor(private grammarExerciseService: GrammarExerciseService) {}

  /**
   * Create a new grammar exercise
   * POST /api/v1/grammar/exercises
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: GrammarExercise_Create_Schema, action: 'createGrammarExercise' }))
    data: GrammarExercise_Create_Type,
  ): Promise<ResponseDataOutput<GrammarExercise_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarExercise_Type>({
      execute: () => this.grammarExerciseService.create(req.user.user_id, data),
      actionName: 'createGrammarExercise',
    });
  }

  /**
   * Get grammar exercise by ID
   * GET /api/v1/grammar/exercises/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<GrammarExercise_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarExercise_Type>({
      execute: () => this.grammarExerciseService.findById(id, req.user.user_id),
      actionName: 'getGrammarExercise',
    });
  }

  /**
   * Get many grammar exercises with pagination and filters
   * GET /api/v1/grammar/exercises
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Query(new ZodValidationPipe({ schema: GrammarExercise_Query_Schema, action: 'getGrammarExercises' }))
    query: GrammarExercise_Query_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<GrammarExercise_ListResponse_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarExercise_ListResponse_Type>({
      execute: () => this.grammarExerciseService.findMany(req.user.user_id, query),
      actionName: 'getGrammarExercises',
    });
  }

  /**
   * Update grammar exercise
   * PUT /api/v1/grammar/exercises/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: GrammarExercise_Update_Schema, action: 'updateGrammarExercise' }))
    data: GrammarExercise_Update_Type,
  ): Promise<ResponseDataOutput<GrammarExercise_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<GrammarExercise_Type>({
      execute: () => this.grammarExerciseService.update(id, req.user.user_id, data),
      actionName: 'updateGrammarExercise',
    });
  }

  /**
   * Delete grammar exercise
   * DELETE /api/v1/grammar/exercises/:id
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
      execute: () => this.grammarExerciseService.delete(id, req.user.user_id),
      actionName: 'deleteGrammarExercise',
    });
  }
}

