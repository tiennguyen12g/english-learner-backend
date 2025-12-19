import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserMongoService } from '../../modules/user/services/user-mongo.service';
import { CustomException } from '../../global/custom-exception.error';
import { JwtUserPayload } from '../../modules/user/user.interface';
@Injectable()
export class TwoFactorAuthGuard extends AuthGuard('2fa') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userMongoService: UserMongoService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload;
    const params: any = request.params;

    const existingUser = await this.userMongoService.findById(params.userID);
    if (!existingUser || existingUser.email !== user.email) {
      throw new CustomException({
        statusCode: 401,
        status: 'Failed',
        message: 'User not found',
      });
    }

    const userObj = existingUser.toObject();
    const is2FAVerified = userObj.secure?.google2FA?.is2FAVerified;
    if (!is2FAVerified) {
      throw new CustomException({
        statusCode: 401,
        status: 'Failed',
        message: '2FA is not enabled for this user',
      });
    }

    console.log('User enabled 2FA');

    const canActivateResult = (await super.canActivate(context)) as boolean;
    return canActivateResult;
  }
}
