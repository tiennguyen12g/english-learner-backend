import { Controller, UseGuards, Patch, Body, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../../validation.pipe';
import { User_ProfileUpdate_Schema, User_ProfileUpdate_Type, User_Type, User_ChangePassword_Schema, User_ChangePassword_Type } from './user.interface';
import { handleRequest } from '../../global/handleRequest';
import { ResponseDataOutput, ResponseDataWhenError } from '../../global/GlobalResponseData';
import { JwtUserPayload } from './user.interface';

@Controller('api/v1/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Update user profile
   * PATCH /api/v1/user/profile
   * Requires authentication (JWT)
   */
  @Patch('profile')
  async updateProfile(
    @Request() req: { user: JwtUserPayload; cookies?: any },
    @Body(new ZodValidationPipe({ schema: User_ProfileUpdate_Schema, action: 'updateProfile' }))
    profileData: User_ProfileUpdate_Type,
  ): Promise<ResponseDataOutput<User_Type | ResponseDataWhenError>> {
    console.log('🔵 [UserController] updateProfile called');
    console.log('🔵 [UserController] req.user:', req.user);
    console.log('🔵 [UserController] req.cookies:', req.cookies);
    
    if (!req.user || !req.user.user_id) {
      console.error('❌ [UserController] No user in request or missing user_id');
      throw new Error('User not authenticated');
    }
    
    return handleRequest<User_Type>({
      execute: () => this.userService.updateProfile(req.user.user_id, profileData),
      actionName: 'updateProfile',
    });
  }

  /**
   * Change user password
   * PATCH /api/v1/user/password
   * Requires authentication (JWT)
   */
  @Patch('password')
  async changePassword(
    @Request() req: { user: JwtUserPayload; cookies?: any },
    @Body(new ZodValidationPipe({ schema: User_ChangePassword_Schema, action: 'changePassword' }))
    passwordData: User_ChangePassword_Type,
  ): Promise<ResponseDataOutput<{ status: string; message: string } | ResponseDataWhenError>> {
    console.log('🔵 [UserController] changePassword called');
    console.log('🔵 [UserController] req.user:', req.user);
    
    if (!req.user || !req.user.user_id) {
      console.error('❌ [UserController] No user in request or missing user_id');
      throw new Error('User not authenticated');
    }
    
    return handleRequest<{ status: string; message: string }>({
      execute: () => this.userService.changePassword(req.user.user_id, passwordData),
      actionName: 'changePassword',
    });
  }
}
