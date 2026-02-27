import { Injectable } from '@nestjs/common';
import { SpeakingGuideMongoService } from './services/speaking-guide-mongo.service';
import {
  SpeakingGuide_Type,
  SpeakingGuide_Create_Type,
  SpeakingGuide_Update_Type,
  SpeakingGuide_Query_Type,
  SpeakingGuide_ListResponse_Type,
} from './speaking.interface';

@Injectable()
export class SpeakingGuideService {
  constructor(private speakingGuideMongoService: SpeakingGuideMongoService) {}

  async create(userId: string, data: SpeakingGuide_Create_Type): Promise<SpeakingGuide_Type> {
    return this.speakingGuideMongoService.create(userId, data);
  }

  async findById(id: string, userId?: string): Promise<SpeakingGuide_Type | null> {
    return this.speakingGuideMongoService.findById(id, userId);
  }

  async findMany(userId: string, query: SpeakingGuide_Query_Type): Promise<SpeakingGuide_ListResponse_Type> {
    return this.speakingGuideMongoService.findMany(userId, query);
  }

  async update(id: string, userId: string, data: SpeakingGuide_Update_Type): Promise<SpeakingGuide_Type> {
    return this.speakingGuideMongoService.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.speakingGuideMongoService.delete(id, userId);
  }

  async incrementViewCount(id: string): Promise<void> {
    return this.speakingGuideMongoService.incrementViewCount(id);
  }
}

