import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    return data ? user?.[data] : user;
  },
);
