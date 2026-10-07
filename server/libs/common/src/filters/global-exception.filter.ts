import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        error = (res as any).error || exception.name;
      } else {
        message = res;
        error = exception.name;
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      (('statusCode' in (exception as any) && typeof (exception as any).statusCode === 'number') ||
        ('status' in (exception as any) && typeof (exception as any).status === 'number'))
    ) {
      const errObj = exception as any;
      status = errObj.statusCode || errObj.status || HttpStatus.BAD_REQUEST;
      const res = errObj.response || errObj;
      message = res.message || errObj.message || 'Request failed';
      error = res.error || errObj.error || 'Error';
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      // In production / external responses, mask internal error details and SQL/DB stacks
      if (
        exception.message &&
        !exception.message.includes('QueryFailedError') &&
        !exception.message.includes('SELECT') &&
        !exception.message.includes('INSERT') &&
        !exception.message.includes('relation')
      ) {
        message = exception.message;
        error = exception.name || 'Error';
      } else {
        message = 'An unexpected error occurred. Please try again later.';
      }
    } else {
      this.logger.error('Unknown exception caught', exception);
      message = 'An unexpected error occurred.';
    }

    if (response && typeof response.status === 'function') {
      response.status(status).json({
        statusCode: status,
        message,
        error,
        timestamp: new Date().toISOString(),
        path: request?.url,
      });
    }
  }
}
