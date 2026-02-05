import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSettings, UserSettingsDocument } from '../entities/user-settings.entity';
import { UpdateUserSettingsDto } from '../dtos/update-user-settings.dto';

@Injectable()
export class UserSettingsRepository {
  constructor(
    @InjectModel(UserSettings.name)
    private readonly settingsModel: Model<UserSettingsDocument>,
  ) {}

  async findByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<UserSettingsDocument | null> {
    return this.settingsModel.findOne({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async createOrUpdate(
    userId: string,
    tenantId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDocument> {
    return this.settingsModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        tenantId: new Types.ObjectId(tenantId),
      },
      {
        $set: {
          ...dto,
          userId: new Types.ObjectId(userId),
          tenantId: new Types.ObjectId(tenantId),
        },
      },
      { new: true, upsert: true },
    );
  }

  async create(userId: string, tenantId: string): Promise<UserSettingsDocument> {
    const settings = new this.settingsModel({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    });
    return settings.save();
  }

  async findUsersWithNotificationEnabled(
    tenantId: string,
    notificationType: keyof Pick<
      UserSettings,
      | 'notifyNewSermons'
      | 'notifyNewEvents'
      | 'notifyCommunityPosts'
      | 'notifyPrayerRequests'
      | 'notifyGroupUpdates'
    >,
  ): Promise<UserSettingsDocument[]> {
    return this.settingsModel.find({
      tenantId: new Types.ObjectId(tenantId),
      [notificationType]: true,
    });
  }
}
