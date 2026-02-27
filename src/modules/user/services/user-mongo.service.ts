import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { User_Register_Type, User_Login_Type, User_Type, User_RegisterOutput_Type, User_ProfileUpdate_Type, User_ChangePassword_Type } from '../user.interface';
import { hashPassword, validateUserPassword } from '../../../utils/bcryptPassword';
import { ResponseData } from '../../../global/GlobalResponseData';

@Injectable()
export class UserMongoService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Create a new user (Signup)
   */
  async mongo_createUser(registerData: User_Register_Type): Promise<User_RegisterOutput_Type> {
    try {
      console.log('🔵 [mongo_createUser] Starting user creation for email:', registerData.email);
      
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: registerData.email }).lean();
      if (existingUser) {
        console.log('❌ [mongo_createUser] User already exists');
        return {
          message: 'User with this email already exists',
          status: 'Failed',
        } as any;
      }

      // Hash password
      console.log('🔵 [mongo_createUser] Hashing password...');
      const hashedPassword = await hashPassword(registerData.password);

      // Create new user
      console.log('🔵 [mongo_createUser] Creating user model...');
      const newUser = new this.userModel({
        email: registerData.email,
        password: hashedPassword,
        role: 'user',
        profile: {
          firstName: registerData.firstName || "English",
          lastName: registerData.lastName || "Learner",
        },
      });

      console.log('🔵 [mongo_createUser] Saving user to database...');
      const savedUser = await newUser.save();
      console.log('✅ [mongo_createUser] User saved successfully with ID:', savedUser._id);
      
      // Verify the user was actually saved by querying the database
      const verifiedUser = await this.userModel.findById(savedUser._id).lean();
      if (!verifiedUser) {
        console.error('❌ [mongo_createUser] User was not found in database after save!');
        throw new Error('Failed to save user to database');
      }
      console.log('✅ [mongo_createUser] User verified in database:', verifiedUser.email);
      
      const { password, ...userWithoutPassword } = savedUser.toObject();

      return {
        message: 'Create account successful',
        status: 'Success',
        user: {
          email: userWithoutPassword.email,
          role: userWithoutPassword.role,
          _id: userWithoutPassword._id.toString(),
          profile: userWithoutPassword.profile,
        },
      } as any;
    } catch (error) {
      console.error('❌ [mongo_createUser] Error creating user:', error);
      if (error.code === 11000) {
        // Duplicate key error
        console.log('❌ [mongo_createUser] Duplicate key error (email already exists)');
        return {
          message: 'User with this email already exists',
          status: 'Failed',
        } as any;
      }
      console.error('❌ [mongo_createUser] Throwing error:', error.message);
      throw error;
    }
  }

  /**
   * Login user
   */
  async mongo_loginUser(loginData: User_Login_Type): Promise<User_Type | null> {
    const user = await this.userModel.findOne({ email: loginData.email }).lean();

    if (!user) {
      return null;
    }

    const isPasswordMatch = await validateUserPassword({
      password: loginData.password,
      hash: user.password,
    });

    if (!isPasswordMatch) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString(),
    } as User_Type;
  }

  /**
   * Get base user data
   */
  async mongo_get_baseUserData({
    existingUser,
  }: {
    existingUser: User_Type;
    network_name?: string;
  }): Promise<any> {
    try {
      const user = await this.userModel.findById(existingUser._id).lean();
      if (!user) {
        return {
          status: 'Failed',
          message: 'User not found',
        };
      }

      const { password, ...userWithoutPassword } = user;
      // Convert _id to string for consistency (same as mongo_loginUser)
      const userData = {
        ...userWithoutPassword,
        _id: userWithoutPassword._id.toString(),
      };
      
      console.log('🔵 [mongo_get_baseUserData] Fetched user data from database:');
      console.log('🔵 [mongo_get_baseUserData] Profile:', JSON.stringify(userData.profile, null, 2));
      
      return {
        status: 'Success',
        message: 'Get user data successful',
        data: userData,
      };
    } catch (error) {
      return {
        status: 'Failed',
        message: error.message,
      };
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Add 2FA secret to user
   */
  async mongo_user_add2fa({
    email,
    user_id,
    secure,
  }: {
    email: string;
    user_id: string;
    secure: { google2FA: { twoFactorSecret: string; otpauth_url: string; is2FAVerified: boolean } };
  }): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email, _id: user_id }).exec();
      if (!user) {
        return {
          status: 'Failed',
          message: 'User not found',
        };
      }

      user.secure = user.secure || {};
      user.secure.google2FA = {
        twoFactorSecret: secure.google2FA.twoFactorSecret,
        otpauth_url: secure.google2FA.otpauth_url,
        is2FAVerified: secure.google2FA.is2FAVerified,
      };

      await user.save();
      return {
        status: 'Success',
        message: '2FA secret added successfully',
        data: {
          otpauth_url: secure.google2FA.otpauth_url,
        },
      };
    } catch (error) {
      return {
        status: 'Failed',
        message: error.message,
      };
    }
  }

  /**
   * Verify and enable 2FA for user
   */
  async mongo_user_verify2FA({ email, user_id }: { email: string; user_id: string }): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email, _id: user_id }).exec();
      if (!user) {
        return {
          status: 'Failed',
          message: 'User not found',
        };
      }

      if (!user.secure?.google2FA) {
        return {
          status: 'Failed',
          message: '2FA not set up for this user',
        };
      }

      user.secure.google2FA.is2FAVerified = true;
      await user.save();

      return {
        status: 'Success',
        message: '2FA verified and enabled successfully',
      };
    } catch (error) {
      return {
        status: 'Failed',
        message: error.message,
      };
    }
  }

  /**
   * Test sensitive data endpoint (requires 2FA)
   */
  async mongo_testSensitive({ email, user_id }: { email: string; user_id: string }): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email, _id: user_id }).lean();
      if (!user) {
        return {
          status: 'Failed',
          message: 'User not found',
        };
      }

      return {
        status: 'Success',
        message: 'Sensitive data accessed successfully',
        data: {
          // Example sensitive data
          accountBalance: '***',
          personalInfo: 'Protected by 2FA',
        },
      };
    } catch (error) {
      return {
        status: 'Failed',
        message: error.message,
      };
    }
  }

  /**
   * Update user profile
   */
  async mongo_updateProfile(userId: string, profileData: User_ProfileUpdate_Type): Promise<User_Type> {
    try {
      console.log('🔵 [mongo_updateProfile] Updating profile for user ID:', userId);
      console.log('🔵 [mongo_updateProfile] Profile data:', profileData);

      // Find user by ID
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.log('❌ [mongo_updateProfile] User not found');
        throw new NotFoundException('User not found');
      }

      // Update profile fields (merge with existing profile)
      if (!user.profile) {
        user.profile = {};
      }

      // Track if any profile field was updated
      let profileUpdated = false;

      // Update only provided fields
      if (profileData.firstName !== undefined) {
        user.profile.firstName = profileData.firstName;
        profileUpdated = true;
      }
      if (profileData.lastName !== undefined) {
        user.profile.lastName = profileData.lastName;
        profileUpdated = true;
      }
      if (profileData.bio !== undefined) {
        user.profile.bio = profileData.bio;
        profileUpdated = true;
      }
      if (profileData.avatar !== undefined) {
        user.profile.avatar = profileData.avatar;
        profileUpdated = true;
      }
      if (profileData.nativeLanguage !== undefined) {
        user.profile.nativeLanguage = profileData.nativeLanguage;
        profileUpdated = true;
      }
      if (profileData.learningLevel !== undefined) {
        user.profile.learningLevel = profileData.learningLevel;
        profileUpdated = true;
      }
      if (profileData.phoneNumber !== undefined) {
        user.profile.phoneNumber = profileData.phoneNumber;
        profileUpdated = true;
      }
      if (profileData.location !== undefined) {
        user.profile.location = profileData.location;
        profileUpdated = true;
      }

      // CRITICAL: Mark the profile object as modified so Mongoose detects the change
      // This is required for nested object updates in Mongoose
      if (profileUpdated) {
        user.markModified('profile');
        console.log('🔵 [mongo_updateProfile] Profile marked as modified');
      }

      // Save updated user
      const updatedUser = await user.save();
      console.log('✅ [mongo_updateProfile] Profile updated successfully');
      console.log('🔵 [mongo_updateProfile] Saved profile:', JSON.stringify(updatedUser.profile, null, 2));

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser.toObject();
      return userWithoutPassword as User_Type;
    } catch (error) {
      console.error('❌ [mongo_updateProfile] Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async mongo_changePassword(userId: string, passwordData: User_ChangePassword_Type): Promise<{ status: string; message: string }> {
    try {
      console.log('🔵 [mongo_changePassword] Changing password for user ID:', userId);

      // Find user by ID
      const user = await this.userModel.findById(userId);
      if (!user) {
        console.log('❌ [mongo_changePassword] User not found');
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await validateUserPassword({
        password: passwordData.currentPassword,
        hash: user.password,
      });

      if (!isCurrentPasswordValid) {
        console.log('❌ [mongo_changePassword] Current password is incorrect');
        return {
          status: 'Failed',
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      console.log('🔵 [mongo_changePassword] Hashing new password...');
      const hashedNewPassword = await hashPassword(passwordData.newPassword);

      // Update password
      user.password = hashedNewPassword;
      
      // Save updated user
      await user.save();
      console.log('✅ [mongo_changePassword] Password changed successfully');

      return {
        status: 'Success',
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('❌ [mongo_changePassword] Error changing password:', error);
      throw error;
    }
  }

  /**
   * Add or update AI provider API key
   */
  async mongo_updateAIProviderKey(
    userId: string,
    provider: 'openai' | 'gemini',
    apiKey: string,
  ): Promise<{ status: string; message: string; provider: string; enabled: boolean }> {
    try {
      console.log(`🔵 [mongo_updateAIProviderKey] Updating ${provider} API key for user ID:`, userId);

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Initialize aiProviders if it doesn't exist
      if (!user.aiProviders) {
        user.aiProviders = {};
      }

      // Update the provider
      user.aiProviders[provider] = {
        apiKey, // Already encrypted from controller
        enabled: true,
        lastUsed: undefined,
      };

      await user.save();
      console.log(`✅ [mongo_updateAIProviderKey] ${provider} API key updated successfully`);

      return {
        status: 'Success',
        message: `${provider} API key updated successfully`,
        provider,
        enabled: true,
      };
    } catch (error) {
      console.error(`❌ [mongo_updateAIProviderKey] Error updating ${provider} API key:`, error);
      throw error;
    }
  }

  /**
   * Get AI provider status (without exposing keys)
   */
  async mongo_getAIProviderStatus(userId: string): Promise<{
    openai?: { enabled: boolean; lastUsed?: Date };
    gemini?: { enabled: boolean; lastUsed?: Date };
  }> {
    try {
      const user = await this.userModel.findById(userId).select('aiProviders').lean();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const status: any = {};
      if (user.aiProviders?.openai) {
        status.openai = {
          enabled: user.aiProviders.openai.enabled,
          lastUsed: user.aiProviders.openai.lastUsed,
        };
      }
      if (user.aiProviders?.gemini) {
        status.gemini = {
          enabled: user.aiProviders.gemini.enabled,
          lastUsed: user.aiProviders.gemini.lastUsed,
        };
      }

      return status;
    } catch (error) {
      console.error('❌ [mongo_getAIProviderStatus] Error getting AI provider status:', error);
      throw error;
    }
  }

  /**
   * Delete AI provider API key
   */
  async mongo_deleteAIProviderKey(
    userId: string,
    provider: 'openai' | 'gemini',
  ): Promise<{ status: string; message: string }> {
    try {
      console.log(`🔵 [mongo_deleteAIProviderKey] Deleting ${provider} API key for user ID:`, userId);

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.aiProviders?.[provider]) {
        delete user.aiProviders[provider];
        await user.save();
        console.log(`✅ [mongo_deleteAIProviderKey] ${provider} API key deleted successfully`);
      }

      return {
        status: 'Success',
        message: `${provider} API key deleted successfully`,
      };
    } catch (error) {
      console.error(`❌ [mongo_deleteAIProviderKey] Error deleting ${provider} API key:`, error);
      throw error;
    }
  }

  /**
   * Get decrypted API key for a provider (for internal use only)
   */
  async mongo_getDecryptedAPIKey(userId: string, provider: 'openai' | 'gemini'): Promise<string | null> {
    try {
      const user = await this.userModel.findById(userId).select('aiProviders').lean();
      if (!user || !user.aiProviders?.[provider]?.apiKey) {
        return null;
      }

      // Return encrypted key (will be decrypted in service layer)
      return user.aiProviders[provider].apiKey;
    } catch (error) {
      console.error(`❌ [mongo_getDecryptedAPIKey] Error getting ${provider} API key:`, error);
      return null;
    }
  }

  /**
   * Update last used timestamp for AI provider
   */
  async mongo_updateAIProviderLastUsed(userId: string, provider: 'openai' | 'gemini'): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user || !user.aiProviders?.[provider]) {
        return;
      }

      user.aiProviders[provider].lastUsed = new Date();
      await user.save();
    } catch (error) {
      console.error(`❌ [mongo_updateAIProviderLastUsed] Error updating last used:`, error);
      // Don't throw, this is not critical
    }
  }
}

