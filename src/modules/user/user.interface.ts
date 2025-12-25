import { z } from 'zod';
import { UserRole } from './user.schema';

// ==================== Zod Schemas ====================

/**
 * User Registration Schema
 */
export const User_Register_Schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

/**
 * User Login Schema
 */
export const User_Login_Schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * User Profile Update Schema
 */
export const User_ProfileUpdate_Schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  nativeLanguage: z.string().optional(),
  learningLevel: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  }, z.date().optional()),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * User Change Password Schema
 */
export const User_ChangePassword_Schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

/**
 * Base User Schema (for validation)
 */
export const User_Schema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.nativeEnum(UserRole).optional(),
});

// ==================== TypeScript Types ====================

/**
 * User Registration Type
 */
export type User_Register_Type = z.infer<typeof User_Register_Schema>;

/**
 * User Login Type
 */
export type User_Login_Type = z.infer<typeof User_Login_Schema>;

/**
 * User Profile Update Type
 */
export type User_ProfileUpdate_Type = z.infer<typeof User_ProfileUpdate_Schema>;

/**
 * User Change Password Type
 */
export type User_ChangePassword_Type = z.infer<typeof User_ChangePassword_Schema>;

/**
 * JWT Payload Type (what's stored in JWT token)
 */
export type JwtUserPayload = {
  email: string;
  user_id: string;
  role?: UserRole;
};

/**
 * Profile Type
 */
export type Profile_Type = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  nativeLanguage?: string;
  learningLevel?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  interests?: string[];
  location?: string;
};

/**
 * Example Type (for vocabulary/phrases/idioms)
 */
export type Example_Type = {
  sentence: string;
  translation?: string;
};

/**
 * Vocabulary Item Type
 */
export type VocabularyItem_Type = {
  word: string;
  type?: string; // vocabulary, phrase, idiom
  meaning?: string;
  pronunciation?: string;
  examples?: Example_Type[];
  tags?: string[];
  addedAt?: Date;
  reviewCount?: number;
  lastReviewedAt?: Date;
  isMastered?: boolean;
};

/**
 * Note Type
 */
export type Note_Type = {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Learning Progress Type
 */
export type LearningProgress_Type = {
  vocabularyCount?: number;
  masteredVocabularyCount?: number;
  notesCount?: number;
  totalStudyTime?: number;
  lastActiveAt?: Date;
  streakDays?: number;
};

/**
 * Material Progress Type
 */
export type MaterialProgress_Type = {
  materialId: string;
  type: string; // speaking, listening, reading, writing
  title?: string;
  progress?: number; // 0-100
  isCompleted?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
};

/**
 * Base User Type
 */
export type User_Type = {
  _id?: string;
  email: string;
  password?: string;
  role?: UserRole;
  profile?: Profile_Type;
  learningProgress?: LearningProgress_Type;
  learningMaterials?: MaterialProgress_Type[];
  secure?: {
    google2FA?: {
      twoFactorSecret?: string;
      otpauth_url?: string;
      is2FAVerified?: boolean;
    };
  };
  isActive?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

// ==================== Response Types ====================

/**
 * User Registration Output
 */
export interface User_RegisterOutput_Type {
  message: string;
  user?: {
    email: string;
    role: UserRole | string;
    _id: string;
  };
}

/**
 * User Login Output
 */
export interface User_LoginOutput_Type {
  user: User_Type;
  access_token: string;
  refresh_token: string;
}

/**
 * User Error Output
 */
export interface User_ErrorOutput_Type {
  message: string;
  status: 'Failed';
}

