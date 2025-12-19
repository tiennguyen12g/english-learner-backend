## Setting JWT
1. Install 
```
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```
## Authentication Flow
Example:
** Client Request: The client sends a POST request to the /v1/auth/login endpoint with the user's email and password.
1. Auth Controller: The request is received by the AuthController, which uses the LocalAuthGuard to protect the route.
2. LocalAuthGuard Activation: The LocalAuthGuard's canActivate method is called, which invokes super.canActivate(context). This triggers the Passport.js authentication flow for the local strategy.
3. LocalStrategy Validation: Passport.js calls the validate method of the LocalStrategy, passing the email and password from the request body. The validate method checks these credentials using the AuthService.
* If the credentials are valid, the user object is returned and attached to the request object (req.user).
* If the credentials are invalid, an UnauthorizedException is thrown.
4. AuthService Login: After successful authentication, the AuthController calls the login method of the AuthService, which generates a JWT token and returns it to the client.

You will see the log flow look like:
```
LocalAuthGuard // Step 1. Run LocalAuthGuard to protect route

LocalStrategy validate test.auth@gmail.com // Step 2 and step 3. Passport.js run validate in LocalStrategy
user.password abcd1234
result {
  _id: new ObjectId('66941ea69d04402873e7cf6a'),
  email: 'test.auth@gmail.com',
  user_id: '9c47bd12-e2ac-4526-bb2e-d325a369f2b8',
  confirmedEmail: false,
  role: 'user',
  __v: 0
}
LocalAuthGuard  result true // validate success, it return result to let LocalAuthGuard know the data is valid and turn back to auth.controller to trigger function login

req.body { email: 'test.auth@gmail.com', password: 'abcd1234' } // step 4. run login to get access token and user data
req.user { 
  _id: new ObjectId('66941ea69d04402873e7cf6a'),
  email: 'test.auth@gmail.com',
  user_id: '9c47bd12-e2ac-4526-bb2e-d325a369f2b8',
  confirmedEmail: false,
  role: 'user',
  __v: 0
}

```
## Explain
A.Explain how LocalAuthGuard connect and run validate in LocalStrategy
1. LocalAuthGuard:
* The LocalAuthGuard extends AuthGuard with the strategy name 'local'. This indicates that it will use the local strategy for authentication.
* When the canActivate method is called, it invokes the super.canActivate(context), which triggers the Passport.js authentication process for the local strategy.
```
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    console.log('localAuthGuard');
    const result = (await super.canActivate(context)) as boolean;
    console.log('LocalAuthGuard result', result);
    return result;
  }
}
```
2. LocalStrategy:
* The LocalStrategy class is registered with Passport.js using the name 'local' when you extend PassportStrategy(Strategy).
* The validate method in LocalStrategy is called automatically by Passport.js during the authentication process. This method checks the provided email and password against the user data stored in your database.
```
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', session: false }); // Change the username field to 'email'
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy validate', email);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

Therefore you will see log result flow:
```
LocalAuthGuard
LocalStrategy validate test.auth@gmail.com
user.password abcd1234
result {
  _id: new ObjectId('66941ea69d04402873e7cf6a'),
  email: 'test.auth@gmail.com',
  user_id: '9c47bd12-e2ac-4526-bb2e-d325a369f2b8',
  confirmedEmail: false,
  role: 'user',
  __v: 0
}
LocalAuthGuard  result true
```
## Note
In summary:

1. Local strategy and guard: Handle user login using username/email and password, and issue JWTs.
2. JWT strategy and guard: Validate the issued JWTs to protect routes and ensure only authenticated users can access them.

## Support
1. Create JWT private key
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```