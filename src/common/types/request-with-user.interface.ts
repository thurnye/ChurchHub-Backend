import { Request } from 'express';
import { UserRole } from './user-role.enum';

export interface RequestUser {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
  permissions?: string[];
}

export interface RequestWithUser extends Request {
  user: RequestUser;
  tenantId: string;
}
