import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { Strategy } from 'passport-custom';
import { TwoFactorAuthenticationService } from './2fa.service';
import { JwtUserPayload } from '../../modules/user/user.interface';
import { CustomException } from '../../global/custom-exception.error';
/**
 * @Importance to know PassportStrategy
 * 1. validate is default function that we have define when extends PassportStrategy.
 * Because after run super function. Passport will automatic call function "validate".
 * If you do not define function "validate" the authentication flow does not work properly.
 * 2. Passport call "validate" and pass to it a data from request.
 * In "validate" function we return all data Passport put to "validate" and return it.
 * The value return in "validate" will go back to JwtAuthGuard.
 * 3. Define the name of strategy.
 * You can define the strategy name here: PassportStrategy(Strategy, 'jwt').
 * If you omit second option <'jwt'>, PassportStrategy will get the name of the file is name of strategy.
 */
@Injectable()
export class Google2FAStrategy extends PassportStrategy(Strategy, '2fa') {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthenticationService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    console.log('Google2FAStrategy trigger');
    const user = req.user as JwtUserPayload;
    const params: any = req.params;
    // console.log('param', params);
    const { token} = req.body;
    const isValid = await this.twoFactorAuthService.verifyToken({
      email: user.email,
      user_id: params.userID,
      token: token,
    });
    if (!isValid) {
      console.log('Invalid 2FA token', 'strategy');
      throw new CustomException({
        statusCode: 401,
        status: "Failed",
        message: 'Invalid 2FA token',
      });
    }
    console.log('isvaliad', isValid);
    return user;
  }
}
