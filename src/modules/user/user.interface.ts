import { z } from 'zod';

// ==================== Zod Schemas ====================

/**
 * User Registration Schema
 */
export const User_Register_Schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * User Login Schema
 */
export const User_Login_Schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Base User Schema (for validation)
 */
export const User_Schema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional(),
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
 * JWT Payload Type (what's stored in JWT token)
 */
export type JwtUserPayload = {
  email: string;
  user_id: string;
  role?: string;
};

/**
 * Base User Type
 */
export type User_Type = {
  _id?: string;
  email: string;
  password?: string;
  role?: string;
  secure?: {
    google2FA?: {
      twoFactorSecret?: string;
      otpauth_url?: string;
      is2FAVerified?: boolean;
    };
  };
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
    role: string;
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

