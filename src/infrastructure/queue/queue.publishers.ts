import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, EventName } from 'src/common/constants/events.constants';
import {
  CommunityPostCreatedEvent,
  EventCreatedEvent,
  PrayerRequestCreatedEvent,
  SermonPublishedEvent,
  WorshipSetScheduledEvent,
  MemberJoinedTenantEvent,
  DonationStatusUpdatedEvent,
} from './events.types';

@Injectable()
export class QueuePublishers {
  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private notificationsQueue: Queue,
  ) {}

  // Generic publish method for flexibility
  async publish(eventName: EventName | string, data: any) {
    await this.notificationsQueue.add(eventName, data);
  }

  async publishCommunityPostCreated(event: CommunityPostCreatedEvent) {
    await this.notificationsQueue.add(EventName.COMMUNITY_POST_CREATED, event);
  }

  async publishEventCreated(event: EventCreatedEvent) {
    await this.notificationsQueue.add(EventName.EVENT_CREATED, event);
  }

  async publishPrayerRequestCreated(event: PrayerRequestCreatedEvent) {
    await this.notificationsQueue.add(EventName.PRAYER_REQUEST_CREATED, event);
  }

  async publishSermonPublished(event: SermonPublishedEvent) {
    await this.notificationsQueue.add(EventName.SERMON_PUBLISHED, event);
  }

  async publishWorshipSetScheduled(event: WorshipSetScheduledEvent) {
    await this.notificationsQueue.add(EventName.WORSHIP_SET_SCHEDULED, event);
  }

  async publishMemberJoinedTenant(event: MemberJoinedTenantEvent) {
    await this.notificationsQueue.add(EventName.MEMBER_JOINED_TENANT, event);
  }

  async publishDonationStatusUpdated(event: DonationStatusUpdatedEvent) {
    await this.notificationsQueue.add(EventName.DONATION_STATUS_UPDATED, event);
  }
}

// Alias for backwards compatibility
export { QueuePublishers as QueuePublisher };
