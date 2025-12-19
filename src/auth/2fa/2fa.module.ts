import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationController } from './2fa.controller';
import { TwoFactorAuthenticationService } from './2fa.service';
import { Google2FAStrategy } from './2fa.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../../modules/user/user.module';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService, Google2FAStrategy],
  exports: [TwoFactorAuthenticationService],
})
export class Auth2FAModule {}