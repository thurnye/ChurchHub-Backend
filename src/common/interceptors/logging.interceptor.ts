import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const requestId = headers['x-request-id'];
    const tenantId = headers['x-tenant-id'];
    const now = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      requestId,
      tenantId,
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - now;

        this.logger.log({
          message: 'Request completed',
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          requestId,
          tenantId,
        });
      }),
    );
  }
}
