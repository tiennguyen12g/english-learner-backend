import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrammarExercise, GrammarExerciseDocument } from '../grammar-exercise.schema';
import { 
  GrammarExercise_Type, 
  GrammarExercise_Create_Type, 
  GrammarExercise_Update_Type,
  GrammarExercise_Query_Type,
  GrammarExercise_ListResponse_Type,
  FillBlankOption_Type,
  MultipleChoiceOption_Type,
} from '../grammar.interface';

@Injectable()
export class GrammarExerciseMongoService {
  constructor(
    @InjectModel(GrammarExercise.name) private grammarExerciseModel: Model<GrammarExerciseDocument>,
  ) {}

  /**
   * Convert Mongoose document to TypeScript type
   */
  private toGrammarExerciseType(doc: GrammarExerciseDocument): GrammarExercise_Type {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      type: doc.type,
      grammarNoteId: doc.grammarNoteId,
      question: doc.question,
      fillBlankOptions: doc.fillBlankOptions?.map(fb => ({
        text: fb.text,
        correctAnswer: fb.correctAnswer,
        alternatives: fb.alternatives || [],
        explanation: fb.explanation,
      })) || [],
      multipleChoiceQuestions: doc.multipleChoiceQuestions?.map(q => ({
        question: q.question,
        options: q.options?.map(mc => ({
          label: mc.label,
          text: mc.text,
          isCorrect: mc.isCorrect,
          explanation: mc.explanation,
        })) || [],
        explanation: q.explanation,
      })) || [],
      // Legacy support - multipleChoiceOptions is not in schema, but kept for backward compatibility
      multipleChoiceOptions: [],
      correctAnswer: doc.correctAnswer,
      alternativeAnswers: doc.alternativeAnswers || [],
      explanation: doc.explanation,
      cefrLevel: doc.cefrLevel,
      difficulty: doc.difficulty,
      tags: doc.tags || [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new grammar exercise
   */
  async create(userId: string, data: GrammarExercise_Create_Type): Promise<GrammarExercise_Type> {
    // Build exercise data, ensuring fillBlankOptions explanations are included
    const exerciseData: any = {
      userId,
      title: data.title,
      type: data.type,
      question: data.question,
      explanation: data.explanation,
      isActive: true,
    };
    
    // Add optional fields
    if (data.grammarNoteId) exerciseData.grammarNoteId = data.grammarNoteId;
    if (data.cefrLevel) exerciseData.cefrLevel = data.cefrLevel;
    if (data.difficulty) exerciseData.difficulty = data.difficulty;
    if (data.tags) exerciseData.tags = data.tags;
    if (data.correctAnswer) exerciseData.correctAnswer = data.correctAnswer;
    if (data.alternativeAnswers) exerciseData.alternativeAnswers = data.alternativeAnswers;
    
    console.log('🔵 [GrammarExercise] Final exerciseData before creating model:', JSON.stringify(exerciseData, null, 2));
    const exercise = new this.grammarExerciseModel(exerciseData);
    
    // Handle fillBlankOptions - set explicitly after model creation to ensure Mongoose recognizes nested schema
    if (data.fillBlankOptions && Array.isArray(data.fillBlankOptions)) {
      console.log('🔵 [GrammarExercise] Received fillBlankOptions in create:', JSON.stringify(data.fillBlankOptions, null, 2));
      const processedFillBlankOptions = data.fillBlankOptions.map((fb, index) => {
        const option: any = {
          text: fb.text,
          correctAnswer: fb.correctAnswer,
          alternatives: fb.alternatives || [],
        };
        // ALWAYS include explanation field if it exists and has content
        if (fb.explanation !== undefined && fb.explanation !== null) {
          const trimmedExplanation = typeof fb.explanation === 'string' ? fb.explanation.trim() : String(fb.explanation).trim();
          if (trimmedExplanation) {
            option.explanation = trimmedExplanation;
            console.log(`✅ [GrammarExercise] Added explanation to blank ${index + 1}:`, option.explanation);
          }
        }
        return option;
      });
      // Use set() method to ensure Mongoose recognizes the nested array change
      exercise.set('fillBlankOptions', processedFillBlankOptions);
      exercise.markModified('fillBlankOptions');
      console.log('🔵 [GrammarExercise] Processed fillBlankOptions for saving:', JSON.stringify(exercise.fillBlankOptions, null, 2));
    }
    
    // Handle multipleChoiceQuestions
    if (data.multipleChoiceQuestions && Array.isArray(data.multipleChoiceQuestions)) {
      // Ensure all required fields are present
      exercise.multipleChoiceQuestions = data.multipleChoiceQuestions.map(q => ({
        question: q.question || '',
        options: (q.options || []).map(opt => ({
          label: opt.label || '',
          text: opt.text || '',
          isCorrect: opt.isCorrect || false,
          explanation: opt.explanation,
        })),
        explanation: q.explanation,
      }));
      exercise.markModified('multipleChoiceQuestions');
    }
    
    // Handle legacy multipleChoiceOptions (not in schema, but kept for compatibility)
    // Note: This field doesn't exist in the schema, so we skip it
    
    console.log('🔵 [GrammarExercise] Exercise object before save:', JSON.stringify(exercise.toObject(), null, 2));
    
    const saved = await exercise.save();
    console.log('🔵 [GrammarExercise] Exercise after save:', JSON.stringify(saved.toObject(), null, 2));
    const result = this.toGrammarExerciseType(saved);
    console.log('🔵 [GrammarExercise] Converted result:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Find grammar exercise by ID
   */
  async findById(id: string, userId: string): Promise<GrammarExercise_Type | null> {
    const exercise = await this.grammarExerciseModel.findOne({
      _id: id,
      userId,
      isActive: true,
    });
    return exercise ? this.toGrammarExerciseType(exercise) : null;
  }

  /**
   * Find many grammar exercises with pagination and filters
   */
  async findMany(userId: string, query: GrammarExercise_Query_Type): Promise<GrammarExercise_ListResponse_Type> {
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
        { question: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.grammarNoteId) {
      filter.grammarNoteId = query.grammarNoteId;
    }

    if (query.cefrLevel) {
      filter.cefrLevel = query.cefrLevel;
    }

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
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
    const [exercises, total] = await Promise.all([
      this.grammarExerciseModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.grammarExerciseModel.countDocuments(filter),
    ]);

    return {
      exercises: exercises.map(ex => this.toGrammarExerciseType(ex as GrammarExerciseDocument)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update grammar exercise
   */
  async update(id: string, userId: string, data: GrammarExercise_Update_Type): Promise<GrammarExercise_Type> {
    const exercise = await this.grammarExerciseModel.findOne({ _id: id, userId, isActive: true });
    if (!exercise) {
      throw new Error('Grammar exercise not found');
    }
    
    console.log('🔵 [GrammarExercise] Update - Received data:', JSON.stringify(data, null, 2));
    
    // Handle fillBlankOptions explicitly to ensure explanations are included
    if (data.fillBlankOptions !== undefined) {
      const processedFillBlankOptions = data.fillBlankOptions.map((fb) => {
        const option: any = {
          text: fb.text,
          correctAnswer: fb.correctAnswer,
          alternatives: fb.alternatives || [],
        };
        // ALWAYS include explanation if it exists
        if (fb.explanation !== undefined && fb.explanation !== null) {
          const trimmedExplanation = typeof fb.explanation === 'string' ? fb.explanation.trim() : String(fb.explanation).trim();
          if (trimmedExplanation) {
            option.explanation = trimmedExplanation;
          }
        }
        return option;
      });
      // Use set() method to ensure Mongoose recognizes the nested array change
      exercise.set('fillBlankOptions', processedFillBlankOptions);
      exercise.markModified('fillBlankOptions');
      console.log('🔵 [GrammarExercise] Update - Processed fillBlankOptions:', JSON.stringify(exercise.fillBlankOptions, null, 2));
    }
    
    // Update other fields
    if (data.title !== undefined) exercise.title = data.title;
    if (data.type !== undefined) exercise.type = data.type;
    if (data.question !== undefined) exercise.question = data.question;
    if (data.explanation !== undefined) exercise.explanation = data.explanation;
    if (data.grammarNoteId !== undefined) exercise.grammarNoteId = data.grammarNoteId;
    if (data.cefrLevel !== undefined) exercise.cefrLevel = data.cefrLevel;
    if (data.difficulty !== undefined) exercise.difficulty = data.difficulty;
    if (data.tags !== undefined) exercise.tags = data.tags;
    if (data.correctAnswer !== undefined) exercise.correctAnswer = data.correctAnswer;
    if (data.alternativeAnswers !== undefined) exercise.alternativeAnswers = data.alternativeAnswers;
    
    if (data.multipleChoiceQuestions !== undefined) {
      // Ensure all required fields are present
      exercise.multipleChoiceQuestions = data.multipleChoiceQuestions.map(q => ({
        question: q.question || '',
        options: (q.options || []).map(opt => ({
          label: opt.label || '',
          text: opt.text || '',
          isCorrect: opt.isCorrect || false,
          explanation: opt.explanation,
        })),
        explanation: q.explanation,
      }));
      exercise.markModified('multipleChoiceQuestions');
    }
    // Note: multipleChoiceOptions is not in schema, so we skip it
    
    exercise.updatedAt = new Date();
    
    console.log('🔵 [GrammarExercise] Update - Exercise before save:', JSON.stringify(exercise.toObject(), null, 2));
    const saved = await exercise.save();
    console.log('🔵 [GrammarExercise] Update - Exercise after save:', JSON.stringify(saved.toObject(), null, 2));
    return this.toGrammarExerciseType(saved);
  }

  /**
   * Delete grammar exercise (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const exercise = await this.grammarExerciseModel.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false, updatedAt: new Date() },
    );
    if (!exercise) {
      throw new Error('Grammar exercise not found');
    }
  }
}

