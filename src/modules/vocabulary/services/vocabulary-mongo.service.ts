import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vocabulary, VocabularyDocument } from '../vocabulary.schema';
import {
  Vocabulary_Type,
  Vocabulary_Create_Type,
  Vocabulary_Update_Type,
  Vocabulary_Query_Type,
  Vocabulary_ListResponse_Type,
} from '../vocabulary.interface';

@Injectable()
export class VocabularyMongoService {
  constructor(
    @InjectModel(Vocabulary.name) private vocabularyModel: Model<VocabularyDocument>,
  ) {}

  /**
   * Create a new vocabulary
   */
  async create(userId: string, createData: Vocabulary_Create_Type): Promise<Vocabulary_Type> {
    const newVocabulary = new this.vocabularyModel({
      ...createData,
      userId,
      difficulty: createData.difficulty || 5,
      isPinned: createData.isPinned || false,
    });

    const savedVocabulary = await newVocabulary.save();
    return this.toVocabularyType(savedVocabulary);
  }

  /**
   * Find vocabulary by ID
   */
  async findById(vocabularyId: string, userId: string): Promise<Vocabulary_Type | null> {
    const vocabulary = await this.vocabularyModel
      .findOne({ _id: vocabularyId, userId })
      .lean();
    
    if (!vocabulary) return null;
    return this.toVocabularyType(vocabulary);
  }

  /**
   * Find vocabularies with pagination and filters
   */
  async findMany(userId: string, query: Vocabulary_Query_Type): Promise<Vocabulary_ListResponse_Type> {
    const {
      page = 1,
      limit = 30,
      search,
      tags,
      wordType,
      difficulty,
      isPinned,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter - always filter by userId (user-specific)
    const filter: any = { userId };

    // Filter by pinned status
    if (isPinned !== undefined) {
      filter.isPinned = isPinned;
    }

    // Filter by tags (themes)
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter['tags.themes'] = { $in: tagArray };
    }

    // Filter by word type
    if (wordType) {
      filter.wordType = { $in: [wordType] };
    }

    // Filter by difficulty
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Search in word, commonMeaning, meaningGroups, and phonetic
    if (search) {
      filter.$or = [
        { word: { $regex: search, $options: 'i' } },
        { commonMeaning: { $regex: search, $options: 'i' } },
        { 'meaningGroups.meaning': { $regex: search, $options: 'i' } },
        { 'meaningGroups.translation': { $regex: search, $options: 'i' } },
        { phonetic: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;
    const [vocabularies, total] = await Promise.all([
      this.vocabularyModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.vocabularyModel.countDocuments(filter),
    ]);

    return {
      vocabularies: vocabularies.map((vocab) => this.toVocabularyType(vocab)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get pinned vocabularies
   */
  async findPinned(userId: string): Promise<Vocabulary_Type[]> {
    const vocabularies = await this.vocabularyModel
      .find({ userId, isPinned: true })
      .sort({ updatedAt: -1 })
      .lean();

    return vocabularies.map((vocab) => this.toVocabularyType(vocab));
  }

  /**
   * Update vocabulary
   */
  async update(
    vocabularyId: string,
    userId: string,
    updateData: Vocabulary_Update_Type,
  ): Promise<Vocabulary_Type> {
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    // Update fields
    Object.assign(vocabulary, updateData);
    const updatedVocabulary = await vocabulary.save();

    return this.toVocabularyType(updatedVocabulary);
  }

  /**
   * Toggle pin status
   */
  async togglePin(vocabularyId: string, userId: string): Promise<Vocabulary_Type> {
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    vocabulary.isPinned = !vocabulary.isPinned;
    const updatedVocabulary = await vocabulary.save();

    return this.toVocabularyType(updatedVocabulary);
  }

  /**
   * Delete vocabulary
   */
  async delete(vocabularyId: string, userId: string): Promise<boolean> {
    const result = await this.vocabularyModel.deleteOne({
      _id: vocabularyId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Vocabulary not found');
    }

    return true;
  }

  /**
   * Convert MongoDB document to Vocabulary_Type
   */
  private toVocabularyType(vocab: any): Vocabulary_Type {
    return {
      _id: vocab._id?.toString(),
      userId: vocab.userId?.toString(),
      word: vocab.word,
      phonetic: vocab.phonetic,
      commonMeaning: vocab.commonMeaning,
      meaningGroups: vocab.meaningGroups || [],
      tags: vocab.tags || { themes: [], actions: [] },
      imageUrl: vocab.imageUrl,
      synonyms: vocab.synonyms || [],
      showTranslation: vocab.showTranslation || false,
      difficulty: vocab.difficulty || 5,
      notes: vocab.notes,
      isPinned: vocab.isPinned || false,
      createdAt: vocab.createdAt,
      updatedAt: vocab.updatedAt,
    };
  }
}

