import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantSettings, TenantSettingsSchema } from './entities/tenant-settings.entity';
import { UserSettings, UserSettingsSchema } from './entities/user-settings.entity';
import { TenantSettingsRepository } from './repositories/tenant-settings.repository';
import { UserSettingsRepository } from './repositories/user-settings.repository';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantSettings.name, schema: TenantSettingsSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    TenantSettingsRepository,
    UserSettingsRepository,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
