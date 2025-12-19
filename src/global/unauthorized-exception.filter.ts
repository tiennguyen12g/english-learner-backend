import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: 401,
      message: 'Custom Unauthorized Message', // Custom message
      status: 'Failed', // Additional custom field
     //  timestamp: new Date().toISOString(),
     //  path: request.url,
    });
  }
}
