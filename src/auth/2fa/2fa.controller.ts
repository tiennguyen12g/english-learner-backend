import { Controller, Get, Post, Param, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { Request } from 'express';
import { TwoFactorAuthGuard } from './2fa-auth.guard';
import { JwtUserPayload } from '../../modules/user/user.interface';
import { UserMongoService } from '../../modules/user/services/user-mongo.service';
import { handleRequest } from '../../global/handleRequest';
import { TwoFactorAuthenticationService } from './2fa.service';
import { encryptSecret } from '../../utils/encryption';
@Controller('api/v1/2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthenticationService,
    private readonly userMongoService: UserMongoService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('generate/:userID')
  async generate(@Req() req: Request, @Param('userID') userID: string) {
    const user = req.user as JwtUserPayload;
    const secret = await this.twoFactorAuthService.generateSecret({
      email: user.email,
      user_id: userID,
    });
    // Encrypt the secret before storing
    const encryptedSecret = encryptSecret(secret.base32!);
    
    // Generate QR code
    const qrCode = await this.twoFactorAuthService.generateQRCode(secret);
    
    const result = await handleRequest({
      execute: () =>
        this.userMongoService.mongo_user_add2fa({
          email: user.email,
          user_id: userID,
          secure: {
            google2FA: {
              twoFactorSecret: encryptedSecret,
              otpauth_url: secret.otpauth_url!,
              is2FAVerified: false,
            },
          },
        }),
      actionName: 'Generate 2FA',
    });

    // Add QR code to response
    if (result.status === 'Success' && result.result) {
      return {
        ...result,
        result: {
          ...result.result,
          qrCode,
        },
      };
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa/:userID')
  async verify(
    @Body() body: { token: string; user_id: string; secret: string },
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    const user = req.user as JwtUserPayload;
    const isValid = await this.twoFactorAuthService.verifyToken({
      user_id: userID,
      email: user.email,
      token: body.token,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    return handleRequest({
      execute: () =>
        this.userMongoService.mongo_user_verify2FA({
          email: user.email,
          user_id: userID,
        }),
      actionName: 'Verify 2FA',
    });
  }

  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
  @Post('getdata/:userID')
  async getSensitiveData(
    @Body() body: { token: string;},
    @Req() req: Request,
    @Param('userID') userID: string,
  ) {
    const user = req.user as JwtUserPayload;
    console.log('user controller', user);
    const sensitiveData = await this.userMongoService.mongo_testSensitive({
      email: user.email,
      user_id: userID,
    });
    return sensitiveData;
  }
}
