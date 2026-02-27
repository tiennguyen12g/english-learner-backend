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
  Vocabulary_Statistics_Type,
  Vocabulary_ProgressHistory_Type,
  Practice_Result_Type,
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
      difficulty: createData.difficulty || 'A1',
      isPinned: createData.isPinned || false,
      reviewStatus: createData.reviewStatus || 'new',
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
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
   * Find vocabulary by word (case-insensitive, handles URL-friendly format)
   * Converts hyphens to spaces for lookup
   */
  async findByWord(wordSlug: string, userId: string): Promise<Vocabulary_Type | null> {
    // Convert URL-friendly format (hyphens) back to spaces
    const word = wordSlug.replace(/-/g, ' ');
    
    const vocabulary = await this.vocabularyModel
      .findOne({ 
        userId,
        word: { $regex: new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      })
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
      reviewStatus,
      dateFrom,
      dateTo,
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

    // Filter by review status
    if (reviewStatus) {
      filter.reviewStatus = reviewStatus;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
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
   * Get statistics for user's vocabulary
   */
  async getStatistics(userId: string): Promise<Vocabulary_Statistics_Type> {
    console.log(`📊 [getStatistics] Fetching statistics for userId: ${userId}`);
    const allVocabularies = await this.vocabularyModel.find({ userId }).lean();
    console.log(`📊 [getStatistics] Found ${allVocabularies.length} vocabulary items for user`);

    // Total words
    const totalWords = allVocabularies.length;

    // Words by difficulty
    const wordsByDifficulty = {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      C2: 0,
    };
    allVocabularies.forEach((vocab) => {
      const diff = vocab.difficulty as keyof typeof wordsByDifficulty;
      if (diff && wordsByDifficulty[diff] !== undefined) {
        wordsByDifficulty[diff]++;
      }
    });

    // Words by review status
    const wordsByReviewStatus = {
      new: 0,
      learning: 0,
      mastered: 0,
      review: 0,
    };
    allVocabularies.forEach((vocab) => {
      const status = vocab.reviewStatus || 'new';
      if (status in wordsByReviewStatus) {
        wordsByReviewStatus[status as keyof typeof wordsByReviewStatus]++;
      }
    });

    // Words by tag
    const tagCounts: Record<string, number> = {};
    allVocabularies.forEach((vocab) => {
      if (vocab.tags?.themes) {
        vocab.tags.themes.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    const wordsByTag = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Learning streak (simplified: consecutive days with at least one review)
    // For now, calculate based on lastReviewedAt dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let learningStreak = 0;
    const reviewedDates = allVocabularies
      .filter((v) => v.lastReviewedAt)
      .map((v) => {
        const date = new Date(v.lastReviewedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
    const uniqueDates = [...new Set(reviewedDates)].sort((a, b) => b - a);
    
    let currentDate = today.getTime();
    for (const reviewDate of uniqueDates) {
      const daysDiff = Math.floor((currentDate - reviewDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === learningStreak) {
        learningStreak++;
        currentDate = reviewDate;
      } else {
        break;
      }
    }

    // Words due for review
    const wordsDueForReview = await this.vocabularyModel.countDocuments({
      userId,
      nextReviewAt: { $lte: new Date() },
      reviewStatus: { $in: ['learning', 'review'] },
    });

    // Total reviews and accuracy
    let totalReviews = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    allVocabularies.forEach((vocab) => {
      totalReviews += vocab.reviewCount || 0;
      totalCorrect += vocab.correctCount || 0;
      totalIncorrect += vocab.incorrectCount || 0;
    });
    const accuracyRate = totalCorrect + totalIncorrect > 0
      ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100
      : 0;

    const statistics = {
      totalWords,
      wordsByDifficulty,
      wordsByReviewStatus,
      wordsByTag,
      learningStreak,
      wordsDueForReview,
      totalReviews,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
    };
    
    console.log(`📊 [getStatistics] Returning statistics:`, JSON.stringify(statistics, null, 2));
    return statistics;
  }

  /**
   * Record practice result and update review status
   */
  async recordPracticeResult(
    vocabularyId: string,
    userId: string,
    result: Practice_Result_Type,
  ): Promise<Vocabulary_Type> {
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    // Update counts
    vocabulary.reviewCount = (vocabulary.reviewCount || 0) + 1;
    if (result.isCorrect) {
      vocabulary.correctCount = (vocabulary.correctCount || 0) + 1;
    } else {
      vocabulary.incorrectCount = (vocabulary.incorrectCount || 0) + 1;
    }

    // Update review status based on performance
    const totalAttempts = vocabulary.correctCount + vocabulary.incorrectCount;
    const accuracy = totalAttempts > 0 ? vocabulary.correctCount / totalAttempts : 0;
    
    // Consider "practiced enough" if reviewCount >= 30
    if (vocabulary.reviewCount >= 30 && accuracy >= 0.8) {
      vocabulary.reviewStatus = 'mastered';
    } else if (accuracy >= 0.8 && vocabulary.reviewCount >= 3) {
      vocabulary.reviewStatus = 'mastered';
    } else if (vocabulary.reviewStatus === 'new') {
      vocabulary.reviewStatus = 'learning';
    } else if (vocabulary.reviewStatus === 'mastered' && !result.isCorrect) {
      vocabulary.reviewStatus = 'review';
    }

    // Update review dates
    vocabulary.lastReviewedAt = new Date();
    
    // Calculate next review date using spaced repetition (simplified)
    const daysUntilNextReview = this.calculateNextReviewInterval(
      vocabulary.reviewCount,
      accuracy,
    );
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilNextReview);
    vocabulary.nextReviewAt = nextReview;

    const updatedVocabulary = await vocabulary.save();
    return this.toVocabularyType(updatedVocabulary);
  }

  /**
   * Calculate next review interval using spaced repetition algorithm
   * Simplified version: increases interval based on review count and accuracy
   */
  private calculateNextReviewInterval(reviewCount: number, accuracy: number): number {
    if (reviewCount === 0) return 1; // First review: next day
    if (reviewCount === 1) return 3; // Second review: 3 days
    if (reviewCount === 2) return 7; // Third review: 1 week
    
    // For subsequent reviews, base on accuracy
    if (accuracy >= 0.9) {
      // High accuracy: longer intervals
      return Math.min(30, 7 * Math.pow(1.5, reviewCount - 2));
    } else if (accuracy >= 0.7) {
      // Medium accuracy: moderate intervals
      return Math.min(14, 3 * Math.pow(1.3, reviewCount - 2));
    } else {
      // Low accuracy: shorter intervals
      return Math.max(1, 2);
    }
  }

  /**
   * Get words for practice (prioritized by practice count and accuracy)
   * Priority algorithm:
   * - Words with lower reviewCount get higher priority
   * - Words with lower accuracy get higher priority
   * - Words with reviewCount > 10 and accuracy > 90% appear less frequently
   * - Words with reviewCount >= 30 are considered "practiced enough" and appear rarely
   */
  async getWordsForPractice(
    userId: string,
    limit: number = 10,
    difficulty?: string,
    reviewStatus?: string,
  ): Promise<Vocabulary_Type[]> {
    const filter: any = { userId };

    // Apply filters
    if (reviewStatus) {
      filter.reviewStatus = reviewStatus;
    }
    // If no reviewStatus specified, get ALL words (priority algorithm will handle selection)

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Get all matching vocabularies
    const allVocabularies = await this.vocabularyModel.find(filter).lean();

    // Calculate priority score for each word
    const vocabulariesWithScore = allVocabularies.map((vocab) => {
      const reviewCount = vocab.reviewCount || 0;
      const correctCount = vocab.correctCount || 0;
      const incorrectCount = vocab.incorrectCount || 0;
      const totalAttempts = correctCount + incorrectCount;
      
      // Calculate accuracy (0 to 1)
      const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 0;
      
      // Base priority: inverse of reviewCount (lower count = higher priority)
      // Add 1 to avoid division by zero
      let basePriority = 1 / (reviewCount + 1);
      
      // Accuracy factor: lower accuracy = higher priority
      // (1 - accuracy) means: 0% accuracy = 1.0, 100% accuracy = 0.0
      const accuracyFactor = 1 - accuracy;
      
      // Combine factors
      let priorityScore = basePriority * (1 + accuracyFactor);
      
      // Reduce priority for words with reviewCount > 10 and accuracy > 90%
      if (reviewCount > 10 && accuracy > 0.9) {
        priorityScore *= 0.3; // Appear 70% less frequently
      }
      
      // Further reduce priority for words with reviewCount >= 30 (practiced enough)
      if (reviewCount >= 30) {
        priorityScore *= 0.1; // Appear 90% less frequently (but still occasionally)
      }
      
      return {
        vocab,
        priorityScore,
        reviewCount,
        accuracy,
      };
    });

    // Sort by priority score (descending) - higher score = higher priority
    vocabulariesWithScore.sort((a, b) => b.priorityScore - a.priorityScore);

    // Take top N words
    const selectedVocabularies = vocabulariesWithScore
      .slice(0, limit)
      .map((item) => item.vocab);

    // Shuffle the selected words slightly to add randomness
    // This prevents always getting the exact same words in the same order
    for (let i = selectedVocabularies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedVocabularies[i], selectedVocabularies[j]] = [
        selectedVocabularies[j],
        selectedVocabularies[i],
      ];
    }

    return selectedVocabularies.map((vocab) => this.toVocabularyType(vocab));
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
      difficulty: vocab.difficulty || 'A1',
      phrasalVerbs: vocab.phrasalVerbs || [],
      wordForms: vocab.wordForms || [],
      practiceSentences: vocab.practiceSentences || [],
      notes: vocab.notes,
      isPinned: vocab.isPinned || false,
      reviewStatus: vocab.reviewStatus || 'new',
      lastReviewedAt: vocab.lastReviewedAt,
      nextReviewAt: vocab.nextReviewAt,
      reviewCount: vocab.reviewCount || 0,
      correctCount: vocab.correctCount || 0,
      incorrectCount: vocab.incorrectCount || 0,
      createdAt: vocab.createdAt,
      updatedAt: vocab.updatedAt,
    };
  }

  /**
   * Get progress history for charts
   * Calculates daily snapshots from existing vocabulary data
   */
  async getProgressHistory(
    userId: string,
    days: number = 30, // Default to last 30 days
  ): Promise<Vocabulary_ProgressHistory_Type> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all vocabularies for the user
    const allVocabularies = await this.vocabularyModel
      .find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    // Generate date range
    const dataPoints: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Count words created up to this date
      const wordsUpToDate = allVocabularies.filter(
        (vocab) => {
          const createdAt = (vocab as any).createdAt;
          return createdAt && new Date(createdAt) <= currentDate;
        },
      );

      // Count words by status (using current status, as we don't have historical status)
      const wordsByStatus = {
        new: wordsUpToDate.filter((v) => (v.reviewStatus || 'new') === 'new').length,
        learning: wordsUpToDate.filter((v) => v.reviewStatus === 'learning').length,
        mastered: wordsUpToDate.filter((v) => v.reviewStatus === 'mastered').length,
        review: wordsUpToDate.filter((v) => v.reviewStatus === 'review').length,
      };

      // Estimate practice count for this date (based on lastReviewedAt)
      // This is an approximation since we don't have a practice history table
      const practicesOnDate = allVocabularies.filter((vocab) => {
        if (!vocab.lastReviewedAt) return false;
        const reviewDate = new Date(vocab.lastReviewedAt);
        return reviewDate.toISOString().split('T')[0] === dateStr;
      });

      // Calculate average accuracy for practices on this date
      let totalAccuracy = 0;
      let accuracyCount = 0;
      practicesOnDate.forEach((vocab) => {
        const correctCount = vocab.correctCount || 0;
        const incorrectCount = vocab.incorrectCount || 0;
        const total = correctCount + incorrectCount;
        if (total > 0) {
          totalAccuracy += correctCount / total;
          accuracyCount++;
        }
      });
      const averageAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;

      dataPoints.push({
        date: dateStr,
        totalWords: wordsUpToDate.length,
        wordsByStatus,
        practiceCount: practicesOnDate.length,
        accuracy: Math.round(averageAccuracy * 100) / 100, // Round to 2 decimal places
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dataPoints,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Find related words (by tags, difficulty, word type)
   */
  async findRelatedWords(
    vocabularyId: string,
    userId: string,
    limit: number = 10,
  ): Promise<Vocabulary_Type[]> {
    // Get the vocabulary to find related words for
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    }).lean();

    if (!vocabulary) {
      return [];
    }

    // Build query for related words
    const query: any = {
      userId,
      _id: { $ne: vocabularyId }, // Exclude the current word
    };

    // Match by tags (themes or actions)
    const tagMatches: any[] = [];
    if (vocabulary.tags?.themes && vocabulary.tags.themes.length > 0) {
      tagMatches.push({ 'tags.themes': { $in: vocabulary.tags.themes } });
    }
    if (vocabulary.tags?.actions && vocabulary.tags.actions.length > 0) {
      tagMatches.push({ 'tags.actions': { $in: vocabulary.tags.actions } });
    }

    // Match by difficulty
    if (vocabulary.difficulty) {
      query.difficulty = vocabulary.difficulty;
    }

    // Match by word type (from meaning groups)
    const wordTypes: string[] = [];
    if (vocabulary.meaningGroups) {
      vocabulary.meaningGroups.forEach((mg) => {
        if (mg.wordType) {
          wordTypes.push(...mg.wordType);
        }
      });
    }

    if (wordTypes.length > 0) {
      query['meaningGroups.wordType'] = { $in: wordTypes };
    }

    // If we have tag matches, use $or
    if (tagMatches.length > 0) {
      query.$or = tagMatches;
    }

    // Find related words
    const relatedVocabularies = await this.vocabularyModel
      .find(query)
      .limit(limit)
      .lean();

    return relatedVocabularies.map((vocab) => this.toVocabularyType(vocab));
  }

  /**
   * Add practice sentence to vocabulary
   */
  async addPracticeSentence(
    vocabularyId: string,
    userId: string,
    practiceSentence: {
      sentence: string;
      correctedSentence?: string;
      grammarScore: number;
      feedback: {
        grammar: string[];
        spelling: string[];
        structure: string[];
        improvements: string[];
      };
      suggestions: string[];
      exampleSentence?: string;
      provider: 'openai' | 'gemini';
      isCorrect?: boolean;
    },
  ): Promise<Vocabulary_Type> {
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    });

    if (!vocabulary) {
      throw new Error('Vocabulary not found');
    }

    // Initialize practiceSentences array if it doesn't exist
    if (!vocabulary.practiceSentences) {
      vocabulary.practiceSentences = [];
    }

    // Add new practice sentence
    vocabulary.practiceSentences.push({
      ...practiceSentence,
      createdAt: new Date(),
    });

    const updatedVocabulary = await vocabulary.save();
    return this.toVocabularyType(updatedVocabulary);
  }

  /**
   * Delete a practice sentence from vocabulary
   */
  async deletePracticeSentence(
    vocabularyId: string,
    userId: string,
    sentenceIndex: number,
  ): Promise<Vocabulary_Type> {
    const vocabulary = await this.vocabularyModel.findOne({
      _id: vocabularyId,
      userId,
    });

    if (!vocabulary) {
      throw new Error('Vocabulary not found');
    }

    if (!vocabulary.practiceSentences || vocabulary.practiceSentences.length === 0) {
      throw new Error('No practice sentences found');
    }

    if (sentenceIndex < 0 || sentenceIndex >= vocabulary.practiceSentences.length) {
      throw new Error('Invalid sentence index');
    }

    // Remove the practice sentence at the specified index
    vocabulary.practiceSentences.splice(sentenceIndex, 1);

    const updatedVocabulary = await vocabulary.save();
    return this.toVocabularyType(updatedVocabulary);
  }
}

