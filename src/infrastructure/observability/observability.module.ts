import { Module, Global } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  controllers: [HealthController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class ObservabilityModule {}
