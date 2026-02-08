import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { envValidationSchema } from '@config/env.schema';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { CacheModule } from '@infrastructure/cache/cache.module';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { NotificationInfraModule } from '@infrastructure/notifications/notification-infra.module';
import { ObservabilityModule } from '@infrastructure/observability/observability.module';

// Modules
import { AuthModule } from '@modules/auth/auth.module';
import { TenantModule } from '@modules/tenant/tenant.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { BibleModule } from '@modules/bible/bible.module';
import { CommunityModule } from '@modules/community/community.module';
import { EventsModule } from '@modules/events/events.module';
import { GiveModule } from '@modules/give/give.module';
import { GroupsModule } from '@modules/groups/groups.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { PrayerModule } from '@modules/prayer/prayer.module';
import { SermonsModule } from '@modules/sermons/sermons.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { WorshipsModule } from '@modules/worships/worships.module';
import { FeedModule } from '@modules/feed/feed.module';
import { DiscoverModule } from '@modules/discover/discover.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),

    // Infrastructure
    DatabaseModule,
    CacheModule,
    QueueModule,
    StorageModule,
    NotificationInfraModule,
    ObservabilityModule,

    // Feature modules
    AuthModule,
    TenantModule,
    ProfileModule,
    BibleModule,
    CommunityModule,
    EventsModule,
    GiveModule,
    GroupsModule,
    NotificationsModule,
    PrayerModule,
    SermonsModule,
    SettingsModule,
    WorshipsModule,
    FeedModule,
    DiscoverModule,
  ],
})
export class AppModule {}
