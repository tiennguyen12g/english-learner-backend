import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor({status, statusCode,message}:{statusCode: number, status: string, message: string}) {
    super({ statusCode, status, message }, statusCode);
  }
}
