export interface RequestContext {
  requestId: string;
  tenantId?: string;
  userId?: string;
  ip: string;
  userAgent: string;
}
