import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SpeakingSituation,
  SpeakingSituationDocument,
} from '../speaking-situation.schema';
import {
  SpeakingSituation_Type,
  SpeakingSituation_Create_Type,
  SpeakingSituation_Update_Type,
  SpeakingSituation_Query_Type,
  SpeakingSituation_ListResponse_Type,
} from '../speaking.interface';

@Injectable()
export class SpeakingSituationMongoService {
  constructor(
    @InjectModel(SpeakingSituation.name)
    private speakingSituationModel: Model<SpeakingSituationDocument>,
  ) {}

  /**
   * Convert Mongoose document to TypeScript type
   */
  private toSpeakingSituationType(doc: any): SpeakingSituation_Type {
    return {
      _id: doc._id?.toString(),
      title: doc.title,
      question: doc.question,
      defaultAnswer: doc.defaultAnswer,
      userId: doc.userId?.toString(),
      tags: doc.tags || [],
      viewCount: doc.viewCount || 0,
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      isPublic: doc.isPublic !== undefined ? doc.isPublic : false,
      userAnswers: doc.userAnswers?.map((ua: any) => ({
        userId: ua.userId?.toString(),
        answer: ua.answer,
        savedAt: ua.savedAt,
      })) || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new speaking situation
   */
  async create(
    userId: string,
    data: SpeakingSituation_Create_Type,
  ): Promise<SpeakingSituation_Type> {
    const situation = new this.speakingSituationModel({
      ...data,
      userId,
    });
    const saved = await situation.save();
    return this.toSpeakingSituationType(saved);
  }

  /**
   * Find speaking situation by ID
   */
  async findById(id: string, userId?: string): Promise<SpeakingSituation_Type | null> {
    const situation = await this.speakingSituationModel.findById(id);
    if (!situation) {
      return null;
    }

    // Check visibility: public or user's own
    if (!situation.isPublic && situation.userId.toString() !== userId) {
      return null;
    }

    return this.toSpeakingSituationType(situation);
  }

  /**
   * Find many speaking situations with pagination and filters
   */
  async findMany(
    query: SpeakingSituation_Query_Type,
    userId?: string,
  ): Promise<SpeakingSituation_ListResponse_Type> {
    const {
      page = 1,
      limit = 10,
      userId: queryUserId,
      tags,
      search,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = {};

    // Visibility filter: show public situations or user's own situations
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
        // User viewing their own situations, can filter by isPublic
        filter.isPublic = isPublic;
      } else {
        // Others can only see public
        filter.isPublic = true;
      }
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        ...(filter.$or || []),
        { title: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
      ];
    }

    // Only show active situations
    filter.isActive = true;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [situations, total] = await Promise.all([
      this.speakingSituationModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.speakingSituationModel.countDocuments(filter).exec(),
    ]);

    return {
      situations: situations.map((situation) => this.toSpeakingSituationType(situation)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update speaking situation
   */
  async update(
    id: string,
    userId: string,
    data: SpeakingSituation_Update_Type,
  ): Promise<SpeakingSituation_Type | null> {
    const situation = await this.speakingSituationModel.findOne({
      _id: id,
      userId,
    });

    if (!situation) {
      return null;
    }

    // Update fields
    Object.assign(situation, data);
    const updated = await situation.save();
    return this.toSpeakingSituationType(updated);
  }

  /**
   * Delete speaking situation
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.speakingSituationModel.deleteOne({
      _id: id,
      userId,
    });
    return result.deletedCount > 0;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.speakingSituationModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
    });
  }

  /**
   * Save or update user answer
   */
  async saveUserAnswer(
    id: string,
    userId: string,
    answer: string,
  ): Promise<SpeakingSituation_Type | null> {
    const situation = await this.speakingSituationModel.findById(id);
    if (!situation) {
      return null;
    }

    // Check if user already has an answer
    const existingAnswerIndex = situation.userAnswers?.findIndex(
      (ua: any) => ua.userId.toString() === userId,
    ) ?? -1;

    const answerData = {
      userId,
      answer,
      savedAt: new Date(),
    };

    if (existingAnswerIndex >= 0 && situation.userAnswers) {
      // Update existing answer
      situation.userAnswers[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      if (!situation.userAnswers) {
        situation.userAnswers = [];
      }
      situation.userAnswers.push(answerData);
    }

    // Mark the array as modified
    situation.markModified('userAnswers');
    const updated = await situation.save();
    return this.toSpeakingSituationType(updated);
  }

  /**
   * Get user's answer for a situation
   */
  async getUserAnswer(id: string, userId: string): Promise<string | null> {
    const situation = await this.speakingSituationModel.findById(id);
    if (!situation) {
      return null;
    }

    const userAnswer = situation.userAnswers?.find(
      (ua: any) => ua.userId.toString() === userId,
    );

    return userAnswer?.answer || null;
  }
}
