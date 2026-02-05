import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TenantSettings, TenantSettingsDocument } from '../entities/tenant-settings.entity';
import { UpdateTenantSettingsDto } from '../dtos/update-tenant-settings.dto';

@Injectable()
export class TenantSettingsRepository {
  constructor(
    @InjectModel(TenantSettings.name)
    private readonly settingsModel: Model<TenantSettingsDocument>,
  ) {}

  async findByTenantId(tenantId: string): Promise<TenantSettingsDocument | null> {
    return this.settingsModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async createOrUpdate(
    tenantId: string,
    dto: UpdateTenantSettingsDto,
  ): Promise<TenantSettingsDocument> {
    return this.settingsModel.findOneAndUpdate(
      { tenantId: new Types.ObjectId(tenantId) },
      { $set: { ...dto, tenantId: new Types.ObjectId(tenantId) } },
      { new: true, upsert: true },
    );
  }

  async create(tenantId: string): Promise<TenantSettingsDocument> {
    const settings = new this.settingsModel({
      tenantId: new Types.ObjectId(tenantId),
    });
    return settings.save();
  }
}
