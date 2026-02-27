import { Injectable } from '@nestjs/common';
import { ListeningAudioMongoService } from './services/listening-audio-mongo.service';
import {
  ListeningAudio_Type,
  ListeningAudio_Create_Type,
  ListeningAudio_Update_Type,
  ListeningAudio_Query_Type,
  ListeningAudio_ListResponse_Type,
} from './listening.interface';

@Injectable()
export class ListeningAudioService {
  constructor(
    private readonly listeningAudioMongoService: ListeningAudioMongoService,
  ) {}

  /**
   * Create a new listening audio
   */
  async create(
    userId: string,
    data: ListeningAudio_Create_Type,
  ): Promise<ListeningAudio_Type> {
    return this.listeningAudioMongoService.create(userId, data);
  }

  /**
   * Find listening audio by ID
   */
  async findById(id: string, userId?: string): Promise<ListeningAudio_Type | null> {
    return this.listeningAudioMongoService.findById(id, userId);
  }

  /**
   * Find many listening audios
   */
  async findMany(
    query: ListeningAudio_Query_Type,
    userId?: string,
  ): Promise<ListeningAudio_ListResponse_Type> {
    return this.listeningAudioMongoService.findMany(query, userId);
  }

  /**
   * Update listening audio
   */
  async update(
    id: string,
    userId: string,
    data: ListeningAudio_Update_Type,
  ): Promise<ListeningAudio_Type | null> {
    return this.listeningAudioMongoService.update(id, userId, data);
  }

  /**
   * Delete listening audio
   */
  async delete(id: string, userId: string): Promise<boolean> {
    return this.listeningAudioMongoService.delete(id, userId);
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    return this.listeningAudioMongoService.incrementViewCount(id);
  }
}
