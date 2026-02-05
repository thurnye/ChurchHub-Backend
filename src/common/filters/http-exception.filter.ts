import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message:
          typeof message === 'string'
            ? message
            : (message as any).message || message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    this.logger.error({
      message: 'Exception caught',
      error: exception,
      requestId: request.headers['x-request-id'],
      tenantId: request.headers['x-tenant-id'],
    });

    response.status(status).json(errorResponse);
  }
}
