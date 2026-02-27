import { z } from 'zod';

// ==================== Zod Schemas ====================

/**
 * Create Listening Audio Schema
 */
export const ListeningAudio_Create_Schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  script: z.string().min(1, 'Script is required'),
  translation: z.string().optional(),
  audioUrl: z.string().min(1, 'Audio URL is required'),
  gender: z.enum(['male', 'female']).default('male').optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Update Listening Audio Schema
 */
export const ListeningAudio_Update_Schema = z.object({
  title: z.string().min(1).max(200).optional(),
  script: z.string().min(1).optional(),
  translation: z.string().optional(),
  audioUrl: z.string().min(1).optional(),
  gender: z.enum(['male', 'female']).optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Query Listening Audios Schema (for filtering)
 */
export const ListeningAudio_Query_Schema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  userId: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(), // Search in title and script
  isPublic: z.coerce.boolean().optional(), // Filter by public/private - coerce string to boolean
  gender: z.enum(['male', 'female']).optional(), // Filter by gender
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// ==================== TypeScript Types ====================

/**
 * Listening Audio Type
 */
export type ListeningAudio_Type = {
  _id?: string;
  title: string;
  script: string;
  translation?: string;
  audioUrl: string;
  gender?: 'male' | 'female';
  note?: string;
  userId: string;
  tags?: string[];
  viewCount?: number;
  isActive?: boolean;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Create Listening Audio Type
 */
export type ListeningAudio_Create_Type = z.infer<typeof ListeningAudio_Create_Schema>;

/**
 * Update Listening Audio Type
 */
export type ListeningAudio_Update_Type = z.infer<typeof ListeningAudio_Update_Schema>;

/**
 * Query Listening Audios Type
 */
export type ListeningAudio_Query_Type = z.infer<typeof ListeningAudio_Query_Schema>;

/**
 * Listening Audio List Response Type
 */
export interface ListeningAudio_ListResponse_Type {
  audios: ListeningAudio_Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
