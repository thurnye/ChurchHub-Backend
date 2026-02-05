import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Note: cache-manager v5+ doesn't have reset() method
    // Use store-specific methods if needed
    const store = (this.cacheManager as any).store;
    if (store && typeof store.reset === 'function') {
      await store.reset();
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return this.cacheManager.wrap(key, fn, ttl);
  }

  // Tenant-specific cache helpers
  getTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  async getTenant<T>(tenantId: string, key: string): Promise<T | undefined> {
    return this.get<T>(this.getTenantKey(tenantId, key));
  }

  async setTenant(tenantId: string, key: string, value: any, ttl?: number): Promise<void> {
    await this.set(this.getTenantKey(tenantId, key), value, ttl);
  }

  async deleteTenant(tenantId: string, key: string): Promise<void> {
    await this.delete(this.getTenantKey(tenantId, key));
  }

  async invalidateTenantCache(tenantId: string): Promise<void> {
    // Note: This is a simplified version. In production, you might want to use Redis SCAN
    // to find and delete all keys matching the pattern
    const pattern = `tenant:${tenantId}:*`;
    // Implementation depends on your cache-manager-redis-yet version
  }
}
