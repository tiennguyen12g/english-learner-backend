import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { GeneratedSecret } from 'speakeasy';
import * as qrcode from 'qrcode';
import { UserMongoService } from '../../modules/user/services/user-mongo.service';
import { User_Type } from '../../modules/user/user.interface';
import { decryptSecret } from '../../utils/encryption';
import { CustomException } from '../../global/custom-exception.error';
@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly userMongoService: UserMongoService) {}

  async generateSecret({ email, user_id }: { email: string; user_id: string }) {
    const user = await this.userMongoService.findById(user_id);
    if (!user || user.email !== email) {
      throw new CustomException({
        statusCode: 401,
        status: 'Failed',
        message: 'No user found',
      });
    }

    const userObj = user.toObject();
    const is2FAVerified = userObj.secure?.google2FA?.is2FAVerified;
    if (is2FAVerified) {
      throw new CustomException({
        statusCode: 401,
        status: 'Failed',
        message: 'You have already enabled 2FA authentication',
      });
    }
    const secret: GeneratedSecret = speakeasy.generateSecret({ name: `NestJS Template (${email})` });
    return secret;
  }

  async generateQRCode(secret: GeneratedSecret): Promise<string> {
    try {
      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url!);
      return qrCodeDataURL;
    } catch (error) {
      console.log('QR code generation error:', error);
      throw new CustomException({
        statusCode: 500,
        status: 'Failed',
        message: 'Failed to generate QR code',
      });
    }
  }

  async verifyToken({ user_id, email, token }: { user_id: string; email: string; token: string }): Promise<boolean> {
    const user = await this.userMongoService.findById(user_id);
    if (!user || user.email !== email) {
      return false;
    }

    const userObj = user.toObject();
    const key2FA_encryption = userObj.secure?.google2FA?.twoFactorSecret;
    if (!key2FA_encryption) {
      return false;
    }

    // Decrypt the secret (if encrypted) or use directly
    const key2FA_decryption = decryptSecret(key2FA_encryption);
    const checkToken = speakeasy.totp.verify({
      secret: key2FA_decryption,
      encoding: 'base32',
      token: token,
    });

    if (!checkToken) {
      console.log('Invalid 2FA token', 'service');
      return false;
    }
    return checkToken;
  }
}
