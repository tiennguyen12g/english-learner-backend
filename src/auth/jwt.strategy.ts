import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';


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
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        let access_token = null;
        
        // Try cookies first
        if (request && request.cookies) {
          access_token = request.cookies['access_token'];
          console.log('🔵 [JwtStrategy] Access token from cookie:', access_token ? 'Found (length: ' + access_token.length + ')' : 'Not found');
        } else {
          console.log('❌ [JwtStrategy] No cookies object in request');
          console.log('🔵 [JwtStrategy] Request object keys:', request ? Object.keys(request).join(', ') : 'No request object');
        }
        
        // Fallback: try Authorization header if cookie not found
        if (!access_token && request.headers.authorization) {
          const authHeader = request.headers.authorization;
          if (authHeader.startsWith('Bearer ')) {
            access_token = authHeader.substring(7);
            console.log('🔵 [JwtStrategy] Using token from Authorization header');
          }
        }
        
        return access_token;
      }]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
      // You can add additional validation logic here
      console.log('🔵 [JwtStrategy] validate called with payload:', payload);
      
      if (!payload || !payload.user_id) {
        console.error('❌ [JwtStrategy] Invalid payload - missing user_id');
        throw new Error('Invalid token payload');
      }
      
      // Return the payload which will be available as req.user in controllers
      return payload;
  }
}
