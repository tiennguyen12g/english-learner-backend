import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SpeakingGuideService } from './speaking-guide.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import type { JwtUserPayload } from '../user/user.interface';
import {
  SpeakingGuide_Create_Schema,
  SpeakingGuide_Update_Schema,
  SpeakingGuide_Query_Schema,
  SpeakingGuide_Type,
  SpeakingGuide_ListResponse_Type,
  SpeakingGuide_Create_Type,
  SpeakingGuide_Update_Type,
  SpeakingGuide_Query_Type,
} from './speaking.interface';

@Controller('api/v1/speaking/guides')
export class SpeakingGuideController {
  constructor(private speakingGuideService: SpeakingGuideService) {}

  /**
   * Create a new speaking guide
   * POST /api/v1/speaking/guides
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: SpeakingGuide_Create_Schema, action: 'createSpeakingGuide' }))
    data: SpeakingGuide_Create_Type,
  ): Promise<ResponseDataOutput<SpeakingGuide_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<SpeakingGuide_Type>({
      execute: () => this.speakingGuideService.create(req.user.user_id, data),
      actionName: 'createSpeakingGuide',
    });
  }

  /**
   * Get speaking guide by ID
   * GET /api/v1/speaking/guides/:id
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req: { user?: JwtUserPayload },
  ): Promise<ResponseDataOutput<SpeakingGuide_Type | ResponseDataWhenError>> {
    const userId = req.user?.user_id;
    return handleRequest<SpeakingGuide_Type>({
      execute: () => {
        const guide = this.speakingGuideService.findById(id, userId);
        // Increment view count asynchronously (don't wait for it)
        this.speakingGuideService.incrementViewCount(id).catch(console.error);
        return guide;
      },
      actionName: 'getSpeakingGuide',
    });
  }

  /**
   * Get many speaking guides with pagination and filters
   * GET /api/v1/speaking/guides
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Query(new ZodValidationPipe({ schema: SpeakingGuide_Query_Schema, action: 'getSpeakingGuides' }))
    query: SpeakingGuide_Query_Type,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<SpeakingGuide_ListResponse_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<SpeakingGuide_ListResponse_Type>({
      execute: () => this.speakingGuideService.findMany(req.user.user_id, query),
      actionName: 'getSpeakingGuides',
    });
  }

  /**
   * Update speaking guide
   * PUT /api/v1/speaking/guides/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: SpeakingGuide_Update_Schema, action: 'updateSpeakingGuide' }))
    data: SpeakingGuide_Update_Type,
  ): Promise<ResponseDataOutput<SpeakingGuide_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }
    return handleRequest<SpeakingGuide_Type>({
      execute: () => this.speakingGuideService.update(id, req.user.user_id, data),
      actionName: 'updateSpeakingGuide',
    });
  }

  /**
   * Delete speaking guide
   * DELETE /api/v1/speaking/guides/:id
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
      execute: () => this.speakingGuideService.delete(id, req.user.user_id),
      actionName: 'deleteSpeakingGuide',
    });
  }
}

