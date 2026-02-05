import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Skip tenant validation for public routes
    const publicPaths = ['/auth/register', '/auth/login', '/health', '/api/docs'];
    const isPublicPath = publicPaths.some((path) => req.path.includes(path));

    if (!isPublicPath && !tenantId) {
      throw new BadRequestException('Tenant ID is required in x-tenant-id header');
    }

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }

    next();
  }
}
