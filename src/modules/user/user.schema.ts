import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// ==================== Enums ====================
export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

// ==================== 2FA Schema ====================
class Google2FASchema {
  @Prop({ type: String })
  twoFactorSecret?: string;

  @Prop({ type: String })
  otpauth_url?: string;

  @Prop({ type: Boolean, default: false })
  is2FAVerified?: boolean;
}

class SecureSchema {
  @Prop({ type: Google2FASchema, _id: false })
  google2FA?: Google2FASchema;
}

// ==================== Profile Schema ====================
class ProfileSchema {
  @Prop({ type: String, trim: true })
  firstName?: string;

  @Prop({ type: String, trim: true })
  lastName?: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String, trim: true })
  bio?: string;

  @Prop({ type: String })
  nativeLanguage?: string;

  @Prop({ type: String })
  learningLevel?: string; // beginner, intermediate, advanced
  @Prop({ type: String })
  phoneNumber?: string;
  @Prop({ type: Date })
  dateOfBirth?: Date
  @Prop({ type: [String], default: [] })
  interests?: string[];
  @Prop({ type: String }) 
  location?: string;
}

// ==================== Vocabulary/Phrase/Idiom Schema ====================
class ExampleSchema {
  @Prop({ type: String, required: true })
  sentence: string;

  @Prop({ type: String })
  translation?: string;
}

class VocabularyItemSchema {
  @Prop({ type: String, required: true, trim: true })
  word: string;

  @Prop({ type: String, trim: true })
  type?: string; // vocabulary, phrase, idiom

  @Prop({ type: String })
  meaning?: string;

  @Prop({ type: String })
  pronunciation?: string;

  @Prop({ type: [ExampleSchema], default: [] })
  examples?: ExampleSchema[];

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: Date, default: Date.now })
  addedAt?: Date;

  @Prop({ type: Number, default: 0 })
  reviewCount?: number;

  @Prop({ type: Date })
  lastReviewedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isMastered?: boolean;
}

// ==================== Note Schema ====================
class NoteSchema {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: String })
  category?: string; // grammar, vocabulary, practice, etc.

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

// ==================== Learning Progress Schema ====================
class LearningProgressSchema {
  @Prop({ type: Number, default: 0 })
  vocabularyCount?: number;

  @Prop({ type: Number, default: 0 })
  masteredVocabularyCount?: number;

  @Prop({ type: Number, default: 0 })
  notesCount?: number;

  @Prop({ type: Number, default: 0 })
  totalStudyTime?: number; // in minutes

  @Prop({ type: Date })
  lastActiveAt?: Date;

  @Prop({ type: Number, default: 0 })
  streakDays?: number; // consecutive days of study
}

// ==================== Learning Materials Schema ====================
class MaterialProgressSchema {
  @Prop({ type: String, required: true })
  materialId: string;

  @Prop({ type: String, required: true })
  type: string; // speaking, listening, reading, writing

  @Prop({ type: String })
  title?: string;

  @Prop({ type: Number, default: 0 })
  progress?: number; // 0-100 percentage

  @Prop({ type: Boolean, default: false })
  isCompleted?: boolean;

  @Prop({ type: Date, default: Date.now })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional data like scores, notes, etc.
}

// ==================== Main User Schema ====================
@Schema({ 
  timestamps: true,
  collection: 'users' // Explicitly set collection name
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.USER 
  })
  role: UserRole;

  @Prop({ type: ProfileSchema, _id: false })
  profile?: ProfileSchema;

  @Prop({ type: LearningProgressSchema, _id: false, default: {} })
  learningProgress?: LearningProgressSchema;

  @Prop({ type: [MaterialProgressSchema], default: [] })
  learningMaterials?: MaterialProgressSchema[];

  @Prop({ type: SecureSchema, _id: false, default: {} })
  secure?: SecureSchema;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

