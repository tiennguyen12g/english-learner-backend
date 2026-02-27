import { Injectable } from '@nestjs/common';
import { UserMongoService } from './services/user-mongo.service';
import { User_Register_Type, User_Login_Type, User_Type, User_ProfileUpdate_Type, User_ChangePassword_Type } from './user.interface';

@Injectable()
export class UserService {
  constructor(private readonly userMongoService: UserMongoService) {}

  /**
   * Register a new user
   */
  async register(registerData: User_Register_Type) {
    return this.userMongoService.mongo_createUser(registerData);
  }

  /**
   * Login user
   */
  async login(loginData: User_Login_Type): Promise<User_Type | null> {
    return this.userMongoService.mongo_loginUser(loginData);
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string) {
    return this.userMongoService.findByEmail(email);
  }

  /**
   * Get user by ID
   */
  async findById(id: string) {
    return this.userMongoService.findById(id);
  }

  /**
   * Get base user data
   */
  async getBaseUserData({ existingUser, network_name }: { existingUser: User_Type; network_name?: string }) {
    return this.userMongoService.mongo_get_baseUserData({ existingUser, network_name });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: User_ProfileUpdate_Type) {
    return this.userMongoService.mongo_updateProfile(userId, profileData);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: User_ChangePassword_Type) {
    return this.userMongoService.mongo_changePassword(userId, passwordData);
  }

  /**
   * Add or update AI provider API key
   */
  async updateAIProviderKey(userId: string, provider: 'openai' | 'gemini', apiKey: string) {
    return this.userMongoService.mongo_updateAIProviderKey(userId, provider, apiKey);
  }

  /**
   * Get AI provider status (without keys)
   */
  async getAIProviderStatus(userId: string) {
    return this.userMongoService.mongo_getAIProviderStatus(userId);
  }

  /**
   * Delete AI provider API key
   */
  async deleteAIProviderKey(userId: string, provider: 'openai' | 'gemini') {
    return this.userMongoService.mongo_deleteAIProviderKey(userId, provider);
  }

  /**
   * Get decrypted API key (for internal use)
   */
  async getDecryptedAPIKey(userId: string, provider: 'openai' | 'gemini') {
    return this.userMongoService.mongo_getDecryptedAPIKey(userId, provider);
  }

  /**
   * Update last used timestamp
   */
  async updateAIProviderLastUsed(userId: string, provider: 'openai' | 'gemini') {
    return this.userMongoService.mongo_updateAIProviderLastUsed(userId, provider);
  }
}

