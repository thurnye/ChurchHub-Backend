import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './entities/tenant.entity';
import { Membership, MembershipSchema } from './entities/membership.entity';
import { JoinCode, JoinCodeSchema } from './entities/join-code.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantService } from './services/tenant.service';
import { TenantController } from './controllers/tenant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: JoinCode.name, schema: JoinCodeSchema },
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
  exports: [TenantService, TenantRepository, MongooseModule],
})
export class TenantModule {}
