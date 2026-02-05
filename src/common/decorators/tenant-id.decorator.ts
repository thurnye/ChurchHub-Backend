import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@common/types';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.tenantId || request.user?.tenantId;
  },
);
