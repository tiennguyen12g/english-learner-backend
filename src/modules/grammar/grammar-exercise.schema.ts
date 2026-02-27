import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GrammarExerciseDocument = GrammarExercise & Document;

// ==================== Fill Blank Option Schema ====================
@Schema({ _id: false })
export class FillBlankOptionSchema {
  @Prop({ type: String, required: true })
  text: string; // The blank text or placeholder

  @Prop({ type: String, required: true })
  correctAnswer: string; // The correct answer for this blank

  @Prop({ type: [String], default: [] })
  alternatives?: string[]; // Alternative correct answers (optional)

  @Prop({ type: String })
  explanation?: string; // Explanation for this specific blank
}

export const FillBlankOptionSchemaFactory = SchemaFactory.createForClass(FillBlankOptionSchema);

// ==================== Multiple Choice Option Schema ====================
@Schema({ _id: false })
export class MultipleChoiceOptionSchema {
  @Prop({ type: String, required: true })
  label: string; // A, B, C, D

  @Prop({ type: String, required: true })
  text: string; // Option text

  @Prop({ type: Boolean, default: false })
  isCorrect: boolean; // Whether this option is correct

  @Prop({ type: String })
  explanation?: string; // Explanation for this option (why it's correct/incorrect)
}

export const MultipleChoiceOptionSchemaFactory = SchemaFactory.createForClass(MultipleChoiceOptionSchema);

@Schema({ timestamps: true, collection: 'grammar_exercises' })
export class GrammarExercise {
  @Prop({ type: String, required: true, ref: 'User' })
  userId: string; // Creator of the exercise

  @Prop({ type: String, required: true, trim: true })
  title: string; // Exercise title

  @Prop({ 
    type: String, 
    required: true,
    enum: ['fillBlank', 'multipleChoice', 'sentenceTransformation', 'errorCorrection', 'matching', 'dragDrop']
  })
  type: string; // Exercise type

  @Prop({ type: String, ref: 'GrammarNote' })
  grammarNoteId?: string; // Optional link to related grammar note

  @Prop({ type: String, required: true })
  question: string; // The question or instruction

  // For fill in the blank exercises
  @Prop({ type: [FillBlankOptionSchemaFactory], default: [] })
  fillBlankOptions?: FillBlankOptionSchema[]; // Blanks and their correct answers

  // For multiple choice exercises - array of questions, each with its own options
  @Prop({ 
    type: [{
      question: { type: String, required: true },
      options: { type: [MultipleChoiceOptionSchemaFactory], required: true },
      explanation: { type: String },
    }], 
    default: [] 
  })
  multipleChoiceQuestions?: Array<{
    question: string;
    options: MultipleChoiceOptionSchema[];
    explanation?: string;
  }>;

  // For other exercise types
  @Prop({ type: String })
  correctAnswer?: string; // General correct answer field

  @Prop({ type: [String], default: [] })
  alternativeAnswers?: string[]; // Alternative correct answers

  @Prop({ type: String, required: true })
  explanation: string; // Explanation of the answer (hidden until user wants to see)

  @Prop({ 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  cefrLevel?: string; // CEFR level

  @Prop({ 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  })
  difficulty?: string; // Difficulty level

  @Prop({ type: [String], default: [] })
  tags?: string[]; // Tags for categorization

  @Prop({ type: Boolean, default: true })
  isActive?: boolean; // Soft delete

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const GrammarExerciseSchema = SchemaFactory.createForClass(GrammarExercise);

// Create indexes for better query performance
GrammarExerciseSchema.index({ userId: 1, isActive: 1 });
GrammarExerciseSchema.index({ type: 1 });
GrammarExerciseSchema.index({ grammarNoteId: 1 });
GrammarExerciseSchema.index({ cefrLevel: 1 });
GrammarExerciseSchema.index({ difficulty: 1 });
GrammarExerciseSchema.index({ tags: 1 });

