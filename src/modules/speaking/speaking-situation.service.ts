import { Injectable } from '@nestjs/common';
import { SpeakingSituationMongoService } from './services/speaking-situation-mongo.service';
import {
  SpeakingSituation_Type,
  SpeakingSituation_Create_Type,
  SpeakingSituation_Update_Type,
  SpeakingSituation_Query_Type,
  SpeakingSituation_ListResponse_Type,
} from './speaking.interface';

@Injectable()
export class SpeakingSituationService {
  constructor(
    private readonly speakingSituationMongoService: SpeakingSituationMongoService,
  ) {}

  /**
   * Create a new speaking situation
   */
  async create(
    userId: string,
    data: SpeakingSituation_Create_Type,
  ): Promise<SpeakingSituation_Type> {
    return this.speakingSituationMongoService.create(userId, data);
  }

  /**
   * Find speaking situation by ID
   */
  async findById(id: string, userId?: string): Promise<SpeakingSituation_Type | null> {
    return this.speakingSituationMongoService.findById(id, userId);
  }

  /**
   * Find many speaking situations
   */
  async findMany(
    query: SpeakingSituation_Query_Type,
    userId?: string,
  ): Promise<SpeakingSituation_ListResponse_Type> {
    return this.speakingSituationMongoService.findMany(query, userId);
  }

  /**
   * Update speaking situation
   */
  async update(
    id: string,
    userId: string,
    data: SpeakingSituation_Update_Type,
  ): Promise<SpeakingSituation_Type | null> {
    return this.speakingSituationMongoService.update(id, userId, data);
  }

  /**
   * Delete speaking situation
   */
  async delete(id: string, userId: string): Promise<boolean> {
    return this.speakingSituationMongoService.delete(id, userId);
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    return this.speakingSituationMongoService.incrementViewCount(id);
  }

  /**
   * Save or update user answer
   */
  async saveUserAnswer(
    id: string,
    userId: string,
    answer: string,
  ): Promise<SpeakingSituation_Type | null> {
    return this.speakingSituationMongoService.saveUserAnswer(id, userId, answer);
  }

  /**
   * Get user's answer for a situation
   */
  async getUserAnswer(id: string, userId: string): Promise<string | null> {
    return this.speakingSituationMongoService.getUserAnswer(id, userId);
  }
}
