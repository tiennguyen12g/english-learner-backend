import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SpeakingGuide, SpeakingGuideDocument } from '../speaking-guide.schema';
import { 
  SpeakingGuide_Type, 
  SpeakingGuide_Create_Type, 
  SpeakingGuide_Update_Type,
  SpeakingGuide_Query_Type,
  SpeakingGuide_ListResponse_Type,
} from '../speaking.interface';

@Injectable()
export class SpeakingGuideMongoService {
  constructor(
    @InjectModel(SpeakingGuide.name) private speakingGuideModel: Model<SpeakingGuideDocument>,
  ) {}

  /**
   * Convert Mongoose document to TypeScript type
   */
  private toSpeakingGuideType(doc: any): SpeakingGuide_Type {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      content: doc.content,
      excerpt: doc.excerpt,
      tags: doc.tags || [],
      coverImage: doc.coverImage,
      viewCount: doc.viewCount || 0,
      isActive: doc.isActive,
      isPublic: doc.isPublic,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new speaking guide
   */
  async create(userId: string, data: SpeakingGuide_Create_Type): Promise<SpeakingGuide_Type> {
    const guide = new this.speakingGuideModel({
      userId,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      tags: data.tags || [],
      coverImage: data.coverImage,
      isPublic: data.isPublic !== undefined ? data.isPublic : false,
      isActive: true,
    });
    const saved = await guide.save();
    return this.toSpeakingGuideType(saved);
  }

  /**
   * Find speaking guide by ID
   */
  async findById(id: string, userId?: string): Promise<SpeakingGuide_Type | null> {
    const filter: any = { _id: id, isActive: true };
    // If userId is provided, allow access to private guides owned by that user
    if (userId) {
      filter.$or = [
        { isPublic: true },
        { userId, isPublic: false },
      ];
    } else {
      filter.isPublic = true; // If no userId, only show public guides
    }
    
    const guide = await this.speakingGuideModel.findOne(filter);
    return guide ? this.toSpeakingGuideType(guide) : null;
  }

  /**
   * Find many speaking guides with pagination and filters
   */
  async findMany(userId: string, query: SpeakingGuide_Query_Type): Promise<SpeakingGuide_ListResponse_Type> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {
      isActive: true,
    };

    // If query specifies isPublic, use that filter
    if (query.isPublic !== undefined) {
      if (query.isPublic) {
        // Only show public guides
        filter.isPublic = true;
      } else {
        // Only show private guides if they belong to the user
        filter.isPublic = false;
        filter.userId = userId;
      }
    } else {
      // Default: show public guides OR private guides owned by the user
      filter.$or = [
        { isPublic: true },
        { userId, isPublic: false },
      ];
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.search) {
      // Add search conditions without overwriting existing $or
      const searchConditions = {
        $or: [
          { title: { $regex: query.search, $options: 'i' } },
          { content: { $regex: query.search, $options: 'i' } },
          { excerpt: { $regex: query.search, $options: 'i' } },
        ],
      };
      
      // If we already have a $or for visibility, combine them with $and
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          searchConditions,
        ];
        delete filter.$or;
      } else {
        filter.$or = searchConditions.$or;
      }
    }

    if (query.tags) {
      filter.tags = { $in: query.tags.split(',') };
    }

    // Build sort
    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    // Execute query
    const [guides, total] = await Promise.all([
      this.speakingGuideModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.speakingGuideModel.countDocuments(filter),
    ]);

    return {
      guides: guides.map(guide => this.toSpeakingGuideType(guide as SpeakingGuideDocument)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update speaking guide
   */
  async update(id: string, userId: string, data: SpeakingGuide_Update_Type): Promise<SpeakingGuide_Type> {
    const guide = await this.speakingGuideModel.findOne({ _id: id, userId, isActive: true });
    if (!guide) {
      throw new Error('Speaking guide not found');
    }
    
    Object.assign(guide, data);
    // updatedAt is automatically set by Mongoose timestamps
    const saved = await guide.save();
    return this.toSpeakingGuideType(saved);
  }

  /**
   * Delete speaking guide (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const guide = await this.speakingGuideModel.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false, updatedAt: new Date() },
    );
    if (!guide) {
      throw new Error('Speaking guide not found');
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.speakingGuideModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }
}

