import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: Map<string, number> = new Map();

  increment(metric: string, value: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  decrement(metric: string, value: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, Math.max(0, current - value));
  }

  gauge(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }

  getMetric(metric: string): number | undefined {
    return this.metrics.get(metric);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }

  // Application-specific metrics
  recordUserLogin(tenantId: string): void {
    this.increment(`tenant.${tenantId}.logins`);
    this.increment('total.logins');
  }

  recordApiCall(endpoint: string): void {
    this.increment(`api.${endpoint}.calls`);
  }

  recordError(type: string): void {
    this.increment(`errors.${type}`);
  }
}
