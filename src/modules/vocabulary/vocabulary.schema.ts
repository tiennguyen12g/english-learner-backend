import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VocabularyDocument = Vocabulary & Document;

// ==================== Example Schema ====================
@Schema({ _id: false })
export class ExampleSchema {
  @Prop({ type: String, required: true })
  sentence: string; // English example sentence

  @Prop({ type: String })
  translation?: string; // Translation in learner's language

  @Prop({ type: Boolean, default: false })
  showTranslation?: boolean; // Whether to show translation by default
}

// ==================== Meaning Group Schema ====================
@Schema({ _id: false })
export class MeaningGroupSchema {
  @Prop({ type: [String], default: [] })
  wordType?: string[]; // Word types for this meaning (e.g., ['noun', 'verb'])

  @Prop({ type: String, required: true })
  meaning: string; // English meaning for this group

  @Prop({ type: String })
  translation?: string; // Translation in learner's language for this meaning

  @Prop({ type: [ExampleSchema], default: [] })
  examples?: ExampleSchema[]; // Examples specific to this meaning
}

// ==================== Tags Schema ====================
@Schema({ _id: false })
export class TagsSchema {
  @Prop({ type: [String], default: [] })
  themes?: string[]; // Predefined themes + custom (e.g., 'house', 'work', 'technology')

  @Prop({ type: [String], default: [] })
  actions?: string[]; // Custom action tags (e.g., 'cooking', 'reading')
}

// ==================== Main Vocabulary Schema ====================
@Schema({ 
  timestamps: true,
  collection: 'vocabularies' // Explicitly set collection name
})
export class Vocabulary {
  @Prop({ type: String, ref: 'User', required: true })
  userId: string; // Reference to User _id - vocabulary is user-specific

  @Prop({ type: String, required: true, trim: true })
  word: string; // English word or phrase

  @Prop({ type: String, trim: true })
  phonetic?: string; // IPA phonetic notation

  @Prop({ type: String, trim: true })
  commonMeaning?: string; // Common English meaning (the meaning that is often used)

  @Prop({ type: [MeaningGroupSchema], default: [] })
  meaningGroups?: MeaningGroupSchema[]; // Multiple meaning groups, each with word type, meaning, translation, and examples

  @Prop({ type: TagsSchema, _id: false, default: {} })
  tags?: TagsSchema;

  @Prop({ type: String })
  imageUrl?: string; // Optional image URL

  @Prop({ type: [String], default: [] })
  synonyms?: string[]; // Optional synonyms

  @Prop({ type: String, trim: true })
  translation?: string; // Learner's language meaning (single language per user)

  @Prop({ type: Boolean, default: false })
  showTranslation?: boolean; // Whether to show translation by default

  @Prop({ type: Number, required: true, min: 1, max: 10, default: 5 })
  difficulty: number; // Difficulty level 1-10

  @Prop({ type: String, trim: true })
  notes?: string; // Optional notes

  @Prop({ type: Boolean, default: false })
  isPinned?: boolean; // Pin status for quick access
}

export const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

// Create indexes for better query performance
VocabularySchema.index({ userId: 1 });
VocabularySchema.index({ userId: 1, isPinned: 1 });
VocabularySchema.index({ userId: 1, createdAt: -1 });
VocabularySchema.index({ userId: 1, word: 'text' }); // Text index for search
VocabularySchema.index({ userId: 1, 'tags.themes': 1 });
VocabularySchema.index({ userId: 1, difficulty: 1 });

