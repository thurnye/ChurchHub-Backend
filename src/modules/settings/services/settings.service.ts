import { Injectable, Logger } from '@nestjs/common';
import { TenantSettingsRepository } from '../repositories/tenant-settings.repository';
import { UserSettingsRepository } from '../repositories/user-settings.repository';
import { UpdateTenantSettingsDto } from '../dtos/update-tenant-settings.dto';
import { UpdateUserSettingsDto } from '../dtos/update-user-settings.dto';
import { TenantSettingsDocument } from '../entities/tenant-settings.entity';
import { UserSettingsDocument } from '../entities/user-settings.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly tenantSettingsRepository: TenantSettingsRepository,
    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}

  // Tenant Settings
  async getTenantSettings(tenantId: string): Promise<TenantSettingsDocument> {
    let settings = await this.tenantSettingsRepository.findByTenantId(tenantId);

    if (!settings) {
      settings = await this.tenantSettingsRepository.create(tenantId);
      this.logger.log(`Created default tenant settings for tenant ${tenantId}`);
    }

    return settings;
  }

  async updateTenantSettings(
    tenantId: string,
    dto: UpdateTenantSettingsDto,
  ): Promise<TenantSettingsDocument> {
    const settings = await this.tenantSettingsRepository.createOrUpdate(tenantId, dto);
    this.logger.log(`Updated tenant settings for tenant ${tenantId}`);
    return settings;
  }

  // User Settings
  async getUserSettings(
    userId: string,
    tenantId: string,
  ): Promise<UserSettingsDocument> {
    let settings = await this.userSettingsRepository.findByUserAndTenant(
      userId,
      tenantId,
    );

    if (!settings) {
      settings = await this.userSettingsRepository.create(userId, tenantId);
      this.logger.log(`Created default user settings for user ${userId} in tenant ${tenantId}`);
    }

    return settings;
  }

  async updateUserSettings(
    userId: string,
    tenantId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDocument> {
    const settings = await this.userSettingsRepository.createOrUpdate(
      userId,
      tenantId,
      dto,
    );
    this.logger.log(`Updated user settings for user ${userId} in tenant ${tenantId}`);
    return settings;
  }

  // Helper to get default bible translation for tenant
  async getDefaultBibleTranslation(tenantId: string): Promise<string | undefined> {
    const settings = await this.getTenantSettings(tenantId);
    return settings.defaultBibleTranslationId;
  }

  // Helper to get notification retention days
  async getNotificationRetentionDays(tenantId: string): Promise<number> {
    const settings = await this.getTenantSettings(tenantId);
    return settings.notificationRetentionDays;
  }

  // Helper to check if user wants specific notification type
  async userWantsNotification(
    userId: string,
    tenantId: string,
    notificationType: 'notifyNewSermons' | 'notifyNewEvents' | 'notifyCommunityPosts' | 'notifyPrayerRequests' | 'notifyGroupUpdates',
  ): Promise<boolean> {
    const settings = await this.getUserSettings(userId, tenantId);
    return settings[notificationType];
  }

  // Get all users who want a specific notification type in a tenant
  async getUsersWantingNotification(
    tenantId: string,
    notificationType: 'notifyNewSermons' | 'notifyNewEvents' | 'notifyCommunityPosts' | 'notifyPrayerRequests' | 'notifyGroupUpdates',
  ): Promise<string[]> {
    const users = await this.userSettingsRepository.findUsersWithNotificationEnabled(
      tenantId,
      notificationType,
    );
    return users.map((u) => u.userId.toString());
  }
}
