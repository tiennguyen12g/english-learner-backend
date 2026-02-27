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

// ==================== Phrasal Verb Schema ====================
@Schema({ _id: false })
export class PhrasalVerbSchema {
  @Prop({ type: String, required: true, trim: true })
  phrase: string; // e.g., "look for", "look at"

  @Prop({ type: String, required: true, trim: true })
  meaning: string; // English meaning

  @Prop({ type: String, trim: true })
  translation?: string; // Learner's language meaning
}

// ==================== Word Form Schema ====================
@Schema({ _id: false })
export class WordFormSchema {
  @Prop({ type: String, required: true, trim: true })
  formType: string; // e.g., "past tense", "plural", "comparative", "superlative", "past participle", "present participle", "third person singular"

  @Prop({ type: String, required: true, trim: true })
  form: string; // The actual word form, e.g., "studied", "children", "better"
}

// ==================== Practice Sentence Schema ====================
@Schema({ _id: false })
export class PracticeSentenceSchema {
  @Prop({ type: String, required: true, trim: true })
  sentence: string; // User's original sentence

  @Prop({ type: String, trim: true })
  correctedSentence?: string; // AI-corrected version

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  grammarScore: number; // 0-100

  @Prop({ type: Object, required: true, _id: false })
  feedback: {
    grammar: string[]; // Grammar errors found
    spelling: string[]; // Spelling mistakes
    structure: string[]; // Sentence structure issues
    improvements: string[]; // Improvement suggestions
  };

  @Prop({ type: [String], default: [] })
  suggestions: string[]; // Additional suggestions

  @Prop({ type: String, trim: true })
  exampleSentence?: string; // B1+ level example sentence

  @Prop({ type: String, enum: ['openai', 'gemini'], required: true })
  provider: string; // Which AI provider was used

  @Prop({ type: Boolean, default: false })
  isCorrect?: boolean; // User's manual mark or auto-mark based on score

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
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

  @Prop({ 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1',
    required: true
  })
  difficulty: string; // CEFR level: A1, A2, B1, B2, C1, C2

  @Prop({ type: [PhrasalVerbSchema], default: [] })
  phrasalVerbs?: PhrasalVerbSchema[]; // Related phrasal verbs

  @Prop({ type: [WordFormSchema], default: [] })
  wordForms?: WordFormSchema[]; // Word forms (past tense, plural, comparative, etc.)

  @Prop({ type: [PracticeSentenceSchema], default: [] })
  practiceSentences?: PracticeSentenceSchema[]; // Practice sentences with AI feedback

  @Prop({ type: String, trim: true })
  notes?: string; // Optional notes

  @Prop({ type: Boolean, default: false })
  isPinned?: boolean; // Pin status for quick access

  @Prop({ 
    type: String, 
    enum: ['new', 'learning', 'mastered', 'review'],
    default: 'new'
  })
  reviewStatus?: string; // Review status: new, learning, mastered, review

  @Prop({ type: Date })
  lastReviewedAt?: Date; // Last time the word was reviewed

  @Prop({ type: Date })
  nextReviewAt?: Date; // Scheduled next review date

  @Prop({ type: Number, default: 0 })
  reviewCount?: number; // Number of times reviewed

  @Prop({ type: Number, default: 0 })
  correctCount?: number; // Number of correct answers in practice

  @Prop({ type: Number, default: 0 })
  incorrectCount?: number; // Number of incorrect answers in practice
}

export const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

// Create indexes for better query performance
VocabularySchema.index({ userId: 1 });
VocabularySchema.index({ userId: 1, isPinned: 1 });
VocabularySchema.index({ userId: 1, createdAt: -1 });
VocabularySchema.index({ userId: 1, word: 'text' }); // Text index for search
VocabularySchema.index({ userId: 1, 'tags.themes': 1 });
VocabularySchema.index({ userId: 1, difficulty: 1 });
VocabularySchema.index({ userId: 1, word: 1 }); // Index for word-based lookup
VocabularySchema.index({ userId: 1, reviewStatus: 1 });
VocabularySchema.index({ userId: 1, nextReviewAt: 1 });
VocabularySchema.index({ userId: 1, createdAt: 1 }); // For date range filtering

