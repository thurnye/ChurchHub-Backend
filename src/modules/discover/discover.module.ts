import { Module } from '@nestjs/common';
import { DiscoverController } from './discover.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [DiscoverController],
})
export class DiscoverModule {}
