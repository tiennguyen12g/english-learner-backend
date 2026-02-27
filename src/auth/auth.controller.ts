import { Controller, Request, Post, UseGuards, Get, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { Response } from 'express';
import { ResponseData, ResponseDataOutput, ResponseDataWhenError } from '../global/GlobalResponseData';
import { handleRequest } from '../global/handleRequest';
import { ZodValidationPipe } from '../validation.pipe';
import { UserService } from '../modules/user/user.service';
import {
  User_Register_Schema,
  User_Login_Schema,
  User_Type,
  User_Register_Type,
  User_Login_Type,
  User_RegisterOutput_Type,
} from '../modules/user/user.interface';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * @Register USER
   */

  // @Public()
  @Public()
  @Post('register')
  async user_register(
    @Body(new ZodValidationPipe({ schema: User_Register_Schema, action: 'createUser' }))
    user_registerBody: User_Register_Type,
  ): Promise<ResponseDataOutput<User_RegisterOutput_Type | ResponseDataWhenError>> {
    return handleRequest<User_RegisterOutput_Type>({
      execute: () => this.userService.register(user_registerBody),
      actionName: 'createUser',
    });
  }

  /**
   * @Login User By user_manual
   */

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async user_login(@Request() req: any, @Res() response: Response) {
    try {
      // if(req.user.status === "Failed") return response.status(HttpStatus.BAD_REQUEST).json(req.user);
      console.log('7. req.user:', req.user);
      const { access_token, refresh_token } = await this.authService.login(req.user);
      const getUserData = await this.userService.getBaseUserData({
        existingUser: req.user,
        network_name: req.body?.network_name,
      });
      if (getUserData.status === 'Success') {
        // Get origin from request to set proper cookie options
        const origin = req.headers.origin;
        console.log('🔵 [Login] Setting cookies for origin:', origin);
        console.log('🔵 [Login] Request protocol:', req.protocol);
        console.log('🔵 [Login] X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
        
        // Determine if request is secure (HTTPS)
        // Check X-Forwarded-Proto if behind proxy (nginx), otherwise check req.protocol
        const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
        const isHttpsOrigin = origin && origin.startsWith('https://');
        
        // CRITICAL: sameSite: 'none' REQUIRES secure: true (browser requirement)
        // Only use 'none' when we can also use secure: true (HTTPS connection)
        // Otherwise, use 'lax' (note: 'lax' doesn't send cookies for cross-origin POST/PATCH, but it's the only option for HTTP)
        const canUseSecure = isSecure; // Can use secure only if connection is HTTPS
        const shouldUseSameSiteNone = isHttpsOrigin && canUseSecure; // Only use 'none' if HTTPS origin AND secure connection
        
        const cookieOptions: any = {
          httpOnly: true,
          secure: canUseSecure && isHttpsOrigin, // Use secure only when connection is HTTPS and origin is HTTPS
          sameSite: shouldUseSameSiteNone ? 'none' : 'lax', // 'none' only when we can use secure: true
        };
        
        console.log('🔵 [Login] Cookie options:', { 
          secure: cookieOptions.secure, 
          sameSite: cookieOptions.sameSite,
          isSecure,
          isHttpsOrigin,
          canUseSecure,
          shouldUseSameSiteNone,
          note: shouldUseSameSiteNone ? 'Using sameSite: none (requires secure: true)' : 'Using sameSite: lax (HTTP backend - cookies may not work for cross-origin POST/PATCH)'
        });
        
        response.cookie('access_token', access_token, {
          ...cookieOptions,
          maxAge: 12 * 60 * 60 * 1000, // 12 hours
        });

        response.cookie('refresh_token', refresh_token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        
        console.log('✅ [Login] Cookies set successfully');

        return response.status(HttpStatus.OK).json(getUserData);
      } else {
        return response.status(HttpStatus.BAD_REQUEST).json(getUserData);
      }
    } catch (error) {
      console.log('Login error:', error);
    }
  }

  // Google login removed from template - can be added as needed

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   * 
   * Must be public - uses refresh_token from httpOnly cookie (doesn't require access_token)
   */
  @Public()
  @Post('refresh-token')
  async refreshToken(@Request() req: any, @Res() response: Response) {
    try {
      console.log('🔵 [RefreshToken] Refresh token request received');
      console.log('🔵 [RefreshToken] Cookies:', req.cookies ? Object.keys(req.cookies).join(', ') : 'No cookies');
      
      const refreshToken = req.cookies.refresh_token; // Get the refresh token from cookies
      
      if (!refreshToken) {
        console.error('❌ [RefreshToken] No refresh_token cookie found');
        return response.status(HttpStatus.UNAUTHORIZED).json({ 
          status: 'Failed',
          message: 'No refresh token provided' 
        });
      }
      
      console.log('🔵 [RefreshToken] Refresh token found, generating new tokens...');
      const newTokens = await this.authService.refreshToken(refreshToken);
      
      // Get origin from request to set proper cookie options
      const origin = req.headers.origin;
      const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
      const isHttpsOrigin = origin && origin.startsWith('https://');
      
      // Same logic as login: only use 'none' when we can use secure: true
      const canUseSecure = isSecure;
      const shouldUseSameSiteNone = isHttpsOrigin && canUseSecure;
      
      // Set new tokens in cookies - use same logic as login
      const cookieOptions: any = {
        httpOnly: true,
        secure: canUseSecure && isHttpsOrigin, // Use secure only when connection is HTTPS and origin is HTTPS
        sameSite: shouldUseSameSiteNone ? 'none' : 'lax', // 'none' only when we can use secure: true
      };
      
      console.log('🔵 [RefreshToken] Cookie options:', { 
        secure: cookieOptions.secure, 
        sameSite: cookieOptions.sameSite,
        isSecure,
        isHttpsOrigin,
        canUseSecure,
        shouldUseSameSiteNone
      });
      
      response.cookie('access_token', newTokens.access_token, {
        ...cookieOptions,
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
      });

      response.cookie('refresh_token', newTokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      response.status(HttpStatus.OK).json({ success: true });
      console.log('✅ [RefreshToken] New tokens set in cookies successfully');
    } catch (error) {
      console.error('❌ [RefreshToken] Error refreshing token:', error);
      response.status(HttpStatus.UNAUTHORIZED).json({ 
        status: 'Failed',
        message: error.message || 'Invalid refresh token' 
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async user_logout(@Res() response: Response) {
    console.log('call logout');
    try {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      return response.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Logout error' });
    }
  }

  // Wallet endpoint removed from template - can be added as needed
}
