import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// 2FA Schema
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

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: SecureSchema, _id: false, default: {} })
  secure?: SecureSchema;
}

export const UserSchema = SchemaFactory.createForClass(User);

