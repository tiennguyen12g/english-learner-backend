import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Reflector } from '@nestjs/core';

/**
 * @How it work?
 * 1. When it was called by controller, JwtAuthGuard run super, the super will run JwtStrategy.
 * ?  How does JwtAuthGuard can call JwtStrategy?
 * 1. In JwtStrategy, we register strategy name 'jwt' to PassportStrategy. 
 * In JwtAuthGuard, we just need to pass the name of strategy to AuthGuard to let the guard know what strategy will go be to call.
 * 
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔵 [JwtAuthGuard] canActivate triggered');
    console.log('🔵 [JwtAuthGuard] isPublic:', isPublic);
    console.log('🔵 [JwtAuthGuard] Route:', context.switchToHttp().getRequest().path);

    if (isPublic) {
      console.log('✅ [JwtAuthGuard] Route is public, skipping auth');
      return true;
    }
    
    console.log('🔵 [JwtAuthGuard] Route requires authentication, checking JWT...');
    return super.canActivate(context); // Delegates to the AuthGuard class (which uses Passport)
  }
}
