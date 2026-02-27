import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpeakingGuideDocument = SpeakingGuide & Document;

// ==================== Main Speaking Guide Schema ====================
@Schema({ 
  timestamps: true,
  collection: 'speaking_guides' // Explicitly set collection name
})
export class SpeakingGuide {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string; // HTML content from Quill editor

  @Prop({ type: String, trim: true })
  excerpt?: string; // Short description/summary

  @Prop({ type: String, ref: 'User', required: true })
  userId: string; // Reference to User _id (creator)

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: String })
  coverImage?: string; // URL to cover image

  @Prop({ type: Number, default: 0 })
  viewCount?: number;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Boolean, default: false })
  isPublic?: boolean; // Public (visible to all) or Private (only creator can see)

  // Timestamps are automatically added by Mongoose when timestamps: true is set
  createdAt?: Date;
  updatedAt?: Date;
}

export const SpeakingGuideSchema = SchemaFactory.createForClass(SpeakingGuide);

// Create indexes for better query performance
SpeakingGuideSchema.index({ userId: 1, isActive: 1 });
SpeakingGuideSchema.index({ isPublic: 1 });
SpeakingGuideSchema.index({ tags: 1 });
SpeakingGuideSchema.index({ createdAt: -1 });

