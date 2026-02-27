import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GrammarNoteDocument = GrammarNote & Document;

// ==================== Key Point Schema ====================
@Schema({ _id: false })
export class KeyPointSchema {
  @Prop({ type: String, required: true })
  text: string;
}

// ==================== Example Schema ====================
@Schema({ _id: false })
export class GrammarExampleSchema {
  @Prop({ type: String, required: true })
  sentence: string; // Example sentence

  @Prop({ type: String })
  explanation?: string; // Optional explanation for the example
}

// ==================== Common Mistake Schema ====================
@Schema({ _id: false })
export class CommonMistakeSchema {
  @Prop({ type: String, required: true })
  incorrect: string; // Incorrect usage

  @Prop({ type: String, required: true })
  correct: string; // Correct usage

  @Prop({ type: String })
  explanation?: string; // Why it's wrong
}

@Schema({ timestamps: true, collection: 'grammar_notes' })
export class GrammarNote {
  @Prop({ type: String, required: true, ref: 'User' })
  userId: string; // Creator of the note

  @Prop({ type: String, required: true, trim: true })
  title: string; // e.g., "Present Perfect vs Past Simple"

  @Prop({ 
    type: String, 
    required: true,
    enum: ['Tenses', 'Conditionals', 'Passive Voice', 'Articles', 'Prepositions', 'Modal Verbs', 'Reported Speech', 'Relative Clauses', 'Gerunds and Infinitives', 'Phrasal Verbs', 'Other']
  })
  category: string; // Grammar category

  @Prop({ 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  cefrLevel?: string; // CEFR level

  @Prop({ type: String, required: true })
  content: string; // Rich text content explaining the rule

  @Prop({ type: [KeyPointSchema], default: [] })
  keyPoints?: KeyPointSchema[]; // Key points to remember

  @Prop({ type: [GrammarExampleSchema], default: [] })
  examples?: GrammarExampleSchema[]; // Correct examples

  @Prop({ type: [CommonMistakeSchema], default: [] })
  commonMistakes?: CommonMistakeSchema[]; // Common mistakes to avoid

  @Prop({ type: [String], default: [] })
  relatedNotes?: string[]; // IDs of related grammar notes

  @Prop({ type: String })
  visualDiagram?: string; // URL to diagram image (optional)

  @Prop({ type: [String], default: [] })
  tags?: string[]; // Tags for categorization

  @Prop({ type: Boolean, default: true })
  isActive?: boolean; // Soft delete

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const GrammarNoteSchema = SchemaFactory.createForClass(GrammarNote);

// Create indexes for better query performance
GrammarNoteSchema.index({ userId: 1, isActive: 1 });
GrammarNoteSchema.index({ category: 1 });
GrammarNoteSchema.index({ cefrLevel: 1 });
GrammarNoteSchema.index({ tags: 1 });

