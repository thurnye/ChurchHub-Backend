import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../entities/tenant.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class TenantRepository extends BaseRepository<TenantDocument> {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {
    super(tenantModel);
  }

  async findBySlug(slug: string): Promise<TenantDocument | null> {
    return this.findOne({ slug });
  }

  async findByJoinCode(joinCode: string): Promise<TenantDocument | null> {
    return this.findOne({ joinCode });
  }

  async incrementMemberCount(tenantId: string): Promise<void> {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $inc: { memberCount: 1 },
    });
  }

  async decrementMemberCount(tenantId: string): Promise<void> {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $inc: { memberCount: -1 },
    });
  }
}
