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
import { ListeningAudioService } from './listening-audio.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import { JwtUserPayload } from '../user/user.interface';
import {
  ListeningAudio_Type,
  ListeningAudio_Create_Type,
  ListeningAudio_Update_Type,
  ListeningAudio_Query_Type,
  ListeningAudio_ListResponse_Type,
  ListeningAudio_Create_Schema,
  ListeningAudio_Update_Schema,
  ListeningAudio_Query_Schema,
} from './listening.interface';

@Controller('api/v1/listening')
export class ListeningAudioController {
  constructor(private readonly listeningAudioService: ListeningAudioService) {}

  /**
   * Create a new listening audio
   * POST /api/v1/listening
   * Requires authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: ListeningAudio_Create_Schema, action: 'createListeningAudio' }))
    createData: ListeningAudio_Create_Type,
  ): Promise<ResponseDataOutput<ListeningAudio_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<ListeningAudio_Type>({
      execute: () => this.listeningAudioService.create(req.user.user_id, createData),
      actionName: 'createListeningAudio',
    });
  }

  /**
   * Get listening audio by ID
   * GET /api/v1/listening/:id
   * Public endpoint (respects isPublic flag)
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req?: { user?: JwtUserPayload },
  ): Promise<ResponseDataOutput<ListeningAudio_Type | ResponseDataWhenError>> {
    const userId = req?.user?.user_id;
    return handleRequest<ListeningAudio_Type>({
      execute: async () => {
        const audio = await this.listeningAudioService.findById(id, userId);
        if (!audio) {
          throw new Error('Listening audio not found');
        }
        // Increment view count in background
        this.listeningAudioService.incrementViewCount(id).catch(console.error);
        return audio;
      },
      actionName: 'getListeningAudio',
    });
  }

  /**
   * Get listening audios with pagination and filters
   * GET /api/v1/listening
   * Public endpoint (respects isPublic flag)
   */
  @Get()
  async findMany(
    @Query(new ZodValidationPipe({ schema: ListeningAudio_Query_Schema, action: 'getListeningAudios' }))
    query: ListeningAudio_Query_Type,
    @Request() req?: { user?: JwtUserPayload },
  ): Promise<ResponseDataOutput<ListeningAudio_ListResponse_Type | ResponseDataWhenError>> {
    const userId = req?.user?.user_id;
    return handleRequest<ListeningAudio_ListResponse_Type>({
      execute: () => this.listeningAudioService.findMany(query, userId),
      actionName: 'getListeningAudios',
    });
  }

  /**
   * Update listening audio
   * PUT /api/v1/listening/:id
   * Requires authentication (author only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req: { user: JwtUserPayload },
    @Body(new ZodValidationPipe({ schema: ListeningAudio_Update_Schema, action: 'updateListeningAudio' }))
    updateData: ListeningAudio_Update_Type,
  ): Promise<ResponseDataOutput<ListeningAudio_Type | ResponseDataWhenError>> {
    if (!req.user || !req.user.user_id) {
      throw new Error('User not authenticated');
    }

    return handleRequest<ListeningAudio_Type>({
      execute: () => this.listeningAudioService.update(id, req.user.user_id, updateData),
      actionName: 'updateListeningAudio',
    });
  }

  /**
   * Delete listening audio
   * DELETE /api/v1/listening/:id
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
        await this.listeningAudioService.delete(id, req.user.user_id);
        return { success: true, message: 'Listening audio deleted successfully' };
      },
      actionName: 'deleteListeningAudio',
    });
  }
}
