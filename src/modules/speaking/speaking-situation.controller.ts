import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SpeakingSituationService } from './speaking-situation.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import { JwtUserPayload } from '../user/user.interface';
import {
  SpeakingSituation_Type,
  SpeakingSituation_Create_Type,
  SpeakingSituation_Update_Type,
  SpeakingSituation_Query_Type,
  SpeakingSituation_ListResponse_Type,
  SpeakingSituation_Create_Schema,
  SpeakingSituation_Update_Schema,
  SpeakingSituation_Query_Schema,
  SaveUserAnswer_Schema,
} from './speaking.interface';

@Controller('api/v1/speaking/situations')
export class SpeakingSituationController {
  constructor(private readonly speakingSituationService: SpeakingSituationService) {}

  /**
   * Create a new speaking situation
   * POST /api/v1/speaking/situations
   * Requires authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: SpeakingSituation_Create_Schema, action: 'createSpeakingSituation' }))
    createData: SpeakingSituation_Create_Type,
  ): Promise<ResponseDataOutput<SpeakingSituation_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<SpeakingSituation_Type>({
      execute: () => this.speakingSituationService.create(req.user.user_id, createData),
      actionName: 'createSpeakingSituation',
    });
  }

  /**
   * Get speaking situation by ID
   * GET /api/v1/speaking/situations/:id
   * Public endpoint (respects isPublic flag)
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req?: { user?: JwtUserPayload },
  ): Promise<ResponseDataOutput<SpeakingSituation_Type | ResponseDataWhenError>> {
    const userId = req?.user?.user_id;
    return handleRequest<SpeakingSituation_Type>({
      execute: async () => {
        const situation = await this.speakingSituationService.findById(id, userId);
        if (!situation) {
          throw new Error('Speaking situation not found');
        }
        // Increment view count in background
        this.speakingSituationService.incrementViewCount(id).catch(console.error);
        return situation;
      },
      actionName: 'getSpeakingSituation',
    });
  }

  /**
   * Get speaking situations with pagination and filters
   * GET /api/v1/speaking/situations
   * Public endpoint (respects isPublic flag)
   */
  @Get()
  async findMany(
    @Query(new ZodValidationPipe({ schema: SpeakingSituation_Query_Schema, action: 'getSpeakingSituations' }))
    query: SpeakingSituation_Query_Type,
    @Request() req?: { user?: JwtUserPayload },
  ): Promise<ResponseDataOutput<SpeakingSituation_ListResponse_Type | ResponseDataWhenError>> {
    const userId = req?.user?.user_id;
    return handleRequest<SpeakingSituation_ListResponse_Type>({
      execute: () => this.speakingSituationService.findMany(query, userId),
      actionName: 'getSpeakingSituations',
    });
  }

  /**
   * Update speaking situation
   * PUT /api/v1/speaking/situations/:id
   * Requires authentication (author only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: SpeakingSituation_Update_Schema, action: 'updateSpeakingSituation' }))
    updateData: SpeakingSituation_Update_Type,
  ): Promise<ResponseDataOutput<SpeakingSituation_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<SpeakingSituation_Type>({
      execute: () => this.speakingSituationService.update(id, req.user.user_id, updateData),
      actionName: 'updateSpeakingSituation',
    });
  }

  /**
   * Delete speaking situation
   * DELETE /api/v1/speaking/situations/:id
   * Requires authentication (author only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<{ success: boolean; message: string } | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<{ success: boolean; message: string }>({
      execute: async () => {
        await this.speakingSituationService.delete(id, req.user.user_id);
        return { success: true, message: 'Speaking situation deleted successfully' };
      },
      actionName: 'deleteSpeakingSituation',
    });
  }

  /**
   * Save user answer for a speaking situation
   * POST /api/v1/speaking/situations/:id/save-answer
   * Requires authentication
   */
  @Post(':id/save-answer')
  @UseGuards(JwtAuthGuard)
  async saveUserAnswer(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: SaveUserAnswer_Schema, action: 'saveUserAnswer' }))
    body: { answer: string },
  ): Promise<ResponseDataOutput<SpeakingSituation_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<SpeakingSituation_Type>({
      execute: () => this.speakingSituationService.saveUserAnswer(id, req.user.user_id, body.answer),
      actionName: 'saveUserAnswer',
    });
  }

  /**
   * Get user's answer for a speaking situation
   * GET /api/v1/speaking/situations/:id/my-answer
   * Requires authentication
   */
  @Get(':id/my-answer')
  @UseGuards(JwtAuthGuard)
  async getUserAnswer(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
  ): Promise<ResponseDataOutput<{ answer: string } | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<{ answer: string }>({
      execute: async () => {
        const answer = await this.speakingSituationService.getUserAnswer(id, req.user.user_id);
        return { answer: answer || '' };
      },
      actionName: 'getUserAnswer',
    });
  }
}
