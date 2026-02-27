import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ListeningAudio,
  ListeningAudioDocument,
} from '../listening-audio.schema';
import {
  ListeningAudio_Type,
  ListeningAudio_Create_Type,
  ListeningAudio_Update_Type,
  ListeningAudio_Query_Type,
  ListeningAudio_ListResponse_Type,
} from '../listening.interface';

@Injectable()
export class ListeningAudioMongoService {
  constructor(
    @InjectModel(ListeningAudio.name)
    private listeningAudioModel: Model<ListeningAudioDocument>,
  ) {}

  /**
   * Convert Mongoose document to TypeScript type
   */
  private toListeningAudioType(doc: any): ListeningAudio_Type {
    return {
      _id: doc._id?.toString(),
      title: doc.title,
      script: doc.script,
      translation: doc.translation,
      audioUrl: doc.audioUrl,
      gender: doc.gender || 'male',
      note: doc.note,
      userId: doc.userId?.toString(),
      tags: doc.tags || [],
      viewCount: doc.viewCount || 0,
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      isPublic: doc.isPublic !== undefined ? doc.isPublic : false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new listening audio
   */
  async create(
    userId: string,
    data: ListeningAudio_Create_Type,
  ): Promise<ListeningAudio_Type> {
    const audio = new this.listeningAudioModel({
      ...data,
      userId,
    });
    const saved = await audio.save();
    return this.toListeningAudioType(saved);
  }

  /**
   * Find listening audio by ID
   */
  async findById(id: string, userId?: string): Promise<ListeningAudio_Type | null> {
    const audio = await this.listeningAudioModel.findById(id);
    if (!audio) {
      return null;
    }

    // Check visibility: public or user's own
    if (!audio.isPublic && audio.userId.toString() !== userId) {
      return null;
    }

    return this.toListeningAudioType(audio);
  }

  /**
   * Find many listening audios with pagination and filters
   */
  async findMany(
    query: ListeningAudio_Query_Type,
    userId?: string,
  ): Promise<ListeningAudio_ListResponse_Type> {
    const {
      page = 1,
      limit = 10,
      userId: queryUserId,
      tags,
      search,
      isPublic,
      gender,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = {};

    // Visibility filter: show public audios or user's own audios
    if (userId) {
      filter.$or = [
        { isPublic: true },
        { userId: userId },
      ];
    } else {
      // If no user, only show public
      filter.isPublic = true;
    }

    // Additional filters
    if (queryUserId) {
      filter.userId = queryUserId;
    }

    if (isPublic !== undefined) {
      if (userId && queryUserId === userId) {
        // User viewing their own audios, can filter by isPublic
        filter.isPublic = isPublic;
      } else {
        // Others can only see public
        filter.isPublic = true;
      }
    }

    if (gender) {
      filter.gender = gender;
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        ...(filter.$or || []),
        { title: { $regex: search, $options: 'i' } },
        { script: { $regex: search, $options: 'i' } },
      ];
    }

    // Only show active audios
    filter.isActive = true;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [audios, total] = await Promise.all([
      this.listeningAudioModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.listeningAudioModel.countDocuments(filter).exec(),
    ]);

    return {
      audios: audios.map((audio) => this.toListeningAudioType(audio)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update listening audio
   */
  async update(
    id: string,
    userId: string,
    data: ListeningAudio_Update_Type,
  ): Promise<ListeningAudio_Type | null> {
    const audio = await this.listeningAudioModel.findOne({
      _id: id,
      userId,
    });

    if (!audio) {
      return null;
    }

    // Update fields
    Object.assign(audio, data);
    const updated = await audio.save();
    return this.toListeningAudioType(updated);
  }

  /**
   * Delete listening audio
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.listeningAudioModel.deleteOne({
      _id: id,
      userId,
    });
    return result.deletedCount > 0;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.listeningAudioModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
    });
  }
}
