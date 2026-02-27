import { z } from 'zod';

// ==================== Zod Schemas ====================

/**
 * Example Schema
 */
export const Example_Schema = z.object({
  sentence: z.string().min(1, 'Example sentence is required'),
  translation: z.string().optional(),
  showTranslation: z.boolean().optional(),
});

/**
 * Meaning Group Schema
 */
export const MeaningGroup_Schema = z.object({
  wordType: z.array(z.string()).optional(),
  meaning: z.string().min(1, 'Meaning is required'),
  translation: z.string().optional(),
  examples: z.array(Example_Schema).optional(),
});

/**
 * Tags Schema
 */
export const Tags_Schema = z.object({
  themes: z.array(z.string()).optional(),
  actions: z.array(z.string()).optional(),
});

/**
 * Phrasal Verb Schema
 */
export const PhrasalVerb_Schema = z.object({
  phrase: z.string().min(1, 'Phrasal verb phrase is required').max(100, 'Phrase is too long'),
  meaning: z.string().min(1, 'Meaning is required').max(500, 'Meaning is too long'),
  translation: z.string().max(500).optional(),
});

/**
 * Word Form Schema
 */
export const WordForm_Schema = z.object({
  formType: z.string().min(1, 'Form type is required').max(50, 'Form type is too long'),
  form: z.string().min(1, 'Form is required').max(200, 'Form is too long'),
});

/**
 * Create Vocabulary Schema
 */
export const Vocabulary_Create_Schema = z.object({
  word: z.string().min(1, 'Word is required').max(200, 'Word is too long'),
  phonetic: z.string().max(100).optional(),
  commonMeaning: z.string().max(500).optional(),
  meaningGroups: z.array(MeaningGroup_Schema).optional(),
  tags: Tags_Schema.optional(),
  imageUrl: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  showTranslation: z.boolean().optional(),
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
  phrasalVerbs: z.array(PhrasalVerb_Schema).optional(),
  wordForms: z.array(WordForm_Schema).optional(),
  notes: z.string().max(1000).optional(),
  isPinned: z.boolean().optional(),
  reviewStatus: z.enum(['new', 'learning', 'mastered', 'review']).optional(),
});

/**
 * Update Vocabulary Schema
 */
export const Vocabulary_Update_Schema = z.object({
  word: z.string().min(1).max(200).optional(),
  phonetic: z.string().max(100).optional(),
  commonMeaning: z.string().max(500).optional(),
  meaningGroups: z.array(MeaningGroup_Schema).optional(),
  tags: Tags_Schema.optional(),
  imageUrl: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  showTranslation: z.boolean().optional(),
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  phrasalVerbs: z.array(PhrasalVerb_Schema).optional(),
  wordForms: z.array(WordForm_Schema).optional(),
  notes: z.string().max(1000).optional(),
  isPinned: z.boolean().optional(),
  reviewStatus: z.enum(['new', 'learning', 'mastered', 'review']).optional(),
  lastReviewedAt: z.date().optional(),
  nextReviewAt: z.date().optional(),
  reviewCount: z.number().optional(),
  correctCount: z.number().optional(),
  incorrectCount: z.number().optional(),
});

/**
 * Query Vocabulary Schema (for filtering and pagination)
 */
export const Vocabulary_Query_Schema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(30).optional(),
  search: z.string().optional(), // Search in word, meaning, translation
  tags: z.string().optional(), // Comma-separated theme tags
  wordType: z.string().optional(), // Filter by word type
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  isPinned: z.coerce.boolean().optional(),
  reviewStatus: z.enum(['new', 'learning', 'mastered', 'review']).optional(),
  dateFrom: z.string().optional(), // ISO date string for date range start
  dateTo: z.string().optional(), // ISO date string for date range end
  sortBy: z.enum(['createdAt', 'updatedAt', 'word', 'difficulty', 'nextReviewAt', 'reviewCount']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// ==================== TypeScript Types ====================

/**
 * Example Type
 */
export type Example_Type = {
  sentence: string;
  translation?: string;
  showTranslation?: boolean;
};

/**
 * Meaning Group Type
 */
export type MeaningGroup_Type = {
  wordType?: string[];
  meaning: string;
  translation?: string;
  examples?: Example_Type[];
};

/**
 * Tags Type
 */
export type Tags_Type = {
  themes?: string[];
  actions?: string[];
};

/**
 * Phrasal Verb Type
 */
export type PhrasalVerb_Type = {
  phrase: string;
  meaning: string;
  translation?: string;
};

export type WordForm_Type = {
  formType: string; // e.g., "past tense", "plural", "comparative", "superlative", "past participle", "present participle", "third person singular"
  form: string; // The actual word form, e.g., "studied", "children", "better"
};

/**
 * Vocabulary Type
 */
export type Vocabulary_Type = {
  _id?: string;
  userId: string;
  word: string;
  phonetic?: string;
  commonMeaning?: string;
  meaningGroups?: MeaningGroup_Type[];
  tags?: Tags_Type;
  imageUrl?: string;
  synonyms?: string[];
  showTranslation?: boolean;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  phrasalVerbs?: PhrasalVerb_Type[];
  wordForms?: WordForm_Type[];
  practiceSentences?: Practice_Sentence_Type[];
  notes?: string;
  isPinned?: boolean;
  reviewStatus?: 'new' | 'learning' | 'mastered' | 'review';
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Create Vocabulary Input Type
 */
export type Vocabulary_Create_Type = z.infer<typeof Vocabulary_Create_Schema>;

/**
 * Update Vocabulary Input Type
 */
export type Vocabulary_Update_Type = z.infer<typeof Vocabulary_Update_Schema>;

/**
 * Query Vocabulary Input Type
 */
export type Vocabulary_Query_Type = z.infer<typeof Vocabulary_Query_Schema>;

/**
 * Vocabulary List Response Type
 */
export type Vocabulary_ListResponse_Type = {
  vocabularies: Vocabulary_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Statistics Response Type
 */
export type Vocabulary_Statistics_Type = {
  totalWords: number;
  wordsByDifficulty: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
  wordsByReviewStatus: {
    new: number;
    learning: number;
    mastered: number;
    review: number;
  };
  wordsByTag: Array<{
    tag: string;
    count: number;
  }>;
  learningStreak: number; // Days of consecutive learning
  wordsDueForReview: number; // Words with nextReviewAt <= today
  totalReviews: number;
  accuracyRate: number; // correctCount / (correctCount + incorrectCount)
};

/**
 * Practice Result Type
 */
export type Practice_Result_Type = {
  vocabularyId: string;
  isCorrect: boolean;
  practiceType: 'flashcard' | 'multipleChoice' | 'typing' | 'sentenceWriting';
};

/**
 * Practice Sentence Type (for sentence writing practice)
 */
export type Practice_Sentence_Type = {
  sentence: string;
  correctedSentence?: string;
  grammarScore: number; // 0-100
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
  createdAt?: Date;
};

/**
 * Sentence Check Request Schema (Zod)
 */
export const Sentence_Check_Request_Schema = z.object({
  vocabularyId: z.string().min(1, 'Vocabulary ID is required'),
  sentence: z.string().min(1, 'Sentence is required'),
  provider: z.enum(['openai', 'gemini']),
  autoMarkThreshold: z.number().min(0).max(100).optional(),
});

/**
 * Sentence Check Request Type
 */
export type Sentence_Check_Request_Type = z.infer<typeof Sentence_Check_Request_Schema>;

/**
 * AI Feedback Response Type
 */
export type AI_Feedback_Type = {
  isCorrect: boolean;
  grammarScore: number; // 0-100
  feedback: {
    grammar: string[];
    spelling: string[];
    structure: string[];
    improvements: string[];
  };
  correctedSentence?: string;
  suggestions: string[];
  exampleSentence?: string; // B1+ level example
};

/**
 * Progress Data Point Type (for charts)
 */
export type Progress_DataPoint_Type = {
  date: string; // ISO date string (YYYY-MM-DD)
  totalWords: number;
  wordsByStatus: {
    new: number;
    learning: number;
    mastered: number;
    review: number;
  };
  practiceCount: number; // Number of practice sessions on this date
  accuracy: number; // Average accuracy for practices on this date
};

/**
 * Progress History Type
 */
export type Vocabulary_ProgressHistory_Type = {
  dataPoints: Progress_DataPoint_Type[];
  dateRange: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
};

