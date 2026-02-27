import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpeakingSituationDocument = SpeakingSituation & Document;

// ==================== Main Speaking Situation Schema ====================
@Schema({ 
  timestamps: true,
  collection: 'speaking_situations' // Explicitly set collection name
})
export class SpeakingSituation {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  question: string; // Long question text

  @Prop({ type: String, required: true })
  defaultAnswer: string; // Default/sample answer

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

  @Prop({
    type: [{
      userId: { type: String, required: true },
      answer: { type: String, required: true },
      savedAt: { type: Date, default: Date.now },
    }],
    default: [],
  })
  userAnswers?: Array<{
    userId: string;
    answer: string;
    savedAt?: Date;
  }>;

  // Timestamps are automatically added by Mongoose when timestamps: true is set
  createdAt?: Date;
  updatedAt?: Date;
}

export const SpeakingSituationSchema = SchemaFactory.createForClass(SpeakingSituation);

// Create indexes for better query performance
SpeakingSituationSchema.index({ userId: 1, isActive: 1 });
SpeakingSituationSchema.index({ isPublic: 1 });
SpeakingSituationSchema.index({ tags: 1 });
SpeakingSituationSchema.index({ createdAt: -1 });
