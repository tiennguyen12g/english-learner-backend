import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ListeningAudioDocument = ListeningAudio & Document;

// ==================== Main Listening Audio Schema ====================
@Schema({ 
  timestamps: true,
  collection: 'listening_audios' // Explicitly set collection name
})
export class ListeningAudio {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  script: string; // The transcript/script of the audio

  @Prop({ type: String })
  translation?: string; // Translation of the script

  @Prop({ type: String, required: true })
  audioUrl: string; // URL to the audio file

  @Prop({ type: String, enum: ['male', 'female'], default: 'male' })
  gender?: 'male' | 'female'; // Voice gender for audio playback

  @Prop({ type: String })
  note?: string; // Additional notes

  @Prop({ type: String, ref: 'User', required: true })
  userId: string; // Reference to User _id (creator)

  @Prop({ type: [String], default: [] })
  tags?: string[];

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

export const ListeningAudioSchema = SchemaFactory.createForClass(ListeningAudio);

// Create indexes for better query performance
ListeningAudioSchema.index({ userId: 1, isActive: 1 });
ListeningAudioSchema.index({ isPublic: 1 });
ListeningAudioSchema.index({ tags: 1 });
ListeningAudioSchema.index({ createdAt: -1 });
