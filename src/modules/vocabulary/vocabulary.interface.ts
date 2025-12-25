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
  difficulty: z.number().min(1).max(10).default(5),
  notes: z.string().max(1000).optional(),
  isPinned: z.boolean().optional(),
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
  difficulty: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
  isPinned: z.boolean().optional(),
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
  difficulty: z.coerce.number().min(1).max(10).optional(),
  isPinned: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'word', 'difficulty']).default('createdAt').optional(),
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
  difficulty: number;
  notes?: string;
  isPinned?: boolean;
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

