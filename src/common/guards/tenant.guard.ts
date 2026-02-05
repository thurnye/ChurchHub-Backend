import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_CONSTANTS } from '../constants/app.constants';

export const TENANT_OPTIONAL_KEY = 'tenantOptional';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers[APP_CONSTANTS.TENANT_HEADER];

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      TENANT_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!tenantId && !isOptional) {
      throw new BadRequestException(
        `${APP_CONSTANTS.TENANT_HEADER} header is required`,
      );
    }

    request.tenantId = tenantId;
    return true;
  }
}
