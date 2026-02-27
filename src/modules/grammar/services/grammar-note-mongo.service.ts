import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrammarNote, GrammarNoteDocument } from '../grammar-note.schema';
import { 
  GrammarNote_Type, 
  GrammarNote_Create_Type, 
  GrammarNote_Update_Type,
  GrammarNote_Query_Type,
  GrammarNote_ListResponse_Type,
  KeyPoint_Type,
  GrammarExample_Type,
  CommonMistake_Type,
} from '../grammar.interface';

@Injectable()
export class GrammarNoteMongoService {
  constructor(
    @InjectModel(GrammarNote.name) private grammarNoteModel: Model<GrammarNoteDocument>,
  ) {}

  /**
   * Convert Mongoose document to TypeScript type
   */
  private toGrammarNoteType(doc: GrammarNoteDocument): GrammarNote_Type {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      category: doc.category,
      cefrLevel: doc.cefrLevel,
      content: doc.content,
      keyPoints: doc.keyPoints?.map(kp => ({ text: kp.text })) || [],
      examples: doc.examples?.map(ex => ({
        sentence: ex.sentence,
        explanation: ex.explanation,
      })) || [],
      commonMistakes: doc.commonMistakes?.map(cm => ({
        incorrect: cm.incorrect,
        correct: cm.correct,
        explanation: cm.explanation,
      })) || [],
      relatedNotes: doc.relatedNotes || [],
      visualDiagram: doc.visualDiagram,
      tags: doc.tags || [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new grammar note
   */
  async create(userId: string, data: GrammarNote_Create_Type): Promise<GrammarNote_Type> {
    const grammarNote = new this.grammarNoteModel({
      userId,
      ...data,
      isActive: true,
    });
    const saved = await grammarNote.save();
    return this.toGrammarNoteType(saved);
  }

  /**
   * Find grammar note by ID
   */
  async findById(id: string, userId: string): Promise<GrammarNote_Type | null> {
    const note = await this.grammarNoteModel.findOne({
      _id: id,
      userId,
      isActive: true,
    });
    return note ? this.toGrammarNoteType(note) : null;
  }

  /**
   * Find many grammar notes with pagination and filters
   */
  async findMany(userId: string, query: GrammarNote_Query_Type): Promise<GrammarNote_ListResponse_Type> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {
      userId,
      isActive: true,
    };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.cefrLevel) {
      filter.cefrLevel = query.cefrLevel;
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
    const [notes, total] = await Promise.all([
      this.grammarNoteModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.grammarNoteModel.countDocuments(filter),
    ]);

    return {
      notes: notes.map(note => this.toGrammarNoteType(note as GrammarNoteDocument)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update grammar note
   */
  async update(id: string, userId: string, data: GrammarNote_Update_Type): Promise<GrammarNote_Type> {
    const note = await this.grammarNoteModel.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { ...data, updatedAt: new Date() },
      { new: true },
    );
    if (!note) {
      throw new Error('Grammar note not found');
    }
    return this.toGrammarNoteType(note);
  }

  /**
   * Delete grammar note (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const note = await this.grammarNoteModel.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false, updatedAt: new Date() },
    );
    if (!note) {
      throw new Error('Grammar note not found');
    }
  }
}

