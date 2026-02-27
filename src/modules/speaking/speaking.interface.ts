import { z } from 'zod';

// ==================== Zod Schemas ====================

/**
 * Create Speaking Guide Schema
 */
export const SpeakingGuide_Create_Schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt is too long').optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Update Speaking Guide Schema
 */
export const SpeakingGuide_Update_Schema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Query Speaking Guides Schema (for filtering)
 */
export const SpeakingGuide_Query_Schema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  userId: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(), // Search in title and content
  isPublic: z.boolean().optional(), // Filter by public/private
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// ==================== TypeScript Types ====================

/**
 * Speaking Guide Type
 */
export type SpeakingGuide_Type = {
  _id?: string;
  title: string;
  content: string;
  excerpt?: string;
  userId: string;
  tags?: string[];
  coverImage?: string;
  viewCount?: number;
  isActive?: boolean;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Create Speaking Guide Type
 */
export type SpeakingGuide_Create_Type = z.infer<typeof SpeakingGuide_Create_Schema>;

/**
 * Update Speaking Guide Type
 */
export type SpeakingGuide_Update_Type = z.infer<typeof SpeakingGuide_Update_Schema>;

/**
 * Query Speaking Guides Type
 */
export type SpeakingGuide_Query_Type = z.infer<typeof SpeakingGuide_Query_Schema>;

/**
 * Speaking Guide List Response Type
 */
export interface SpeakingGuide_ListResponse_Type {
  guides: SpeakingGuide_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Speaking Situation Schemas ====================

/**
 * Create Speaking Situation Schema
 */
export const SpeakingSituation_Create_Schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  question: z.string().min(1, 'Question is required'),
  defaultAnswer: z.string().min(1, 'Default answer is required'),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Update Speaking Situation Schema
 */
export const SpeakingSituation_Update_Schema = z.object({
  title: z.string().min(1).max(200).optional(),
  question: z.string().min(1).optional(),
  defaultAnswer: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Query Speaking Situations Schema (for filtering)
 */
export const SpeakingSituation_Query_Schema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  userId: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(), // Search in title and question
  isPublic: z.coerce.boolean().optional(), // Filter by public/private
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// ==================== Speaking Situation Types ====================

/**
 * User Answer Type
 */
export type UserAnswer_Type = {
  userId: string;
  answer: string;
  savedAt?: Date;
};

/**
 * Speaking Situation Type
 */
export type SpeakingSituation_Type = {
  _id?: string;
  title: string;
  question: string;
  defaultAnswer: string;
  userId: string;
  tags?: string[];
  viewCount?: number;
  isActive?: boolean;
  isPublic?: boolean;
  userAnswers?: UserAnswer_Type[];
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Create Speaking Situation Type
 */
export type SpeakingSituation_Create_Type = z.infer<typeof SpeakingSituation_Create_Schema>;

/**
 * Update Speaking Situation Type
 */
export type SpeakingSituation_Update_Type = z.infer<typeof SpeakingSituation_Update_Schema>;

/**
 * Query Speaking Situations Type
 */
export type SpeakingSituation_Query_Type = z.infer<typeof SpeakingSituation_Query_Schema>;

/**
 * Speaking Situation List Response Type
 */
export interface SpeakingSituation_ListResponse_Type {
  situations: SpeakingSituation_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Save User Answer Schema
 */
export const SaveUserAnswer_Schema = z.object({
  answer: z.string().min(1, 'Answer is required'),
});
