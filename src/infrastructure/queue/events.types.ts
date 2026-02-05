export interface BaseEvent {
  tenantId: string;
  userId: string;
  timestamp: Date;
}

export interface CommunityPostCreatedEvent extends BaseEvent {
  postId: string;
  content: string;
  authorName: string;
}

export interface EventCreatedEvent extends BaseEvent {
  eventId: string;
  title: string;
  startDate: Date;
}

export interface PrayerRequestCreatedEvent extends BaseEvent {
  prayerId: string;
  title: string;
  visibility: 'everyone' | 'clergy' | 'admin_clergy' | 'groups';
  groupIds?: string[];
}

export interface SermonPublishedEvent extends BaseEvent {
  sermonId: string;
  title: string;
  speaker: string;
}

export interface WorshipSetScheduledEvent extends BaseEvent {
  worshipId: string;
  title: string;
  scheduledFor: Date;
}

export interface MemberJoinedTenantEvent extends BaseEvent {
  memberName: string;
  role: string;
}

export interface DonationStatusUpdatedEvent extends BaseEvent {
  donationId: string;
  amount: number;
  status: string;
}
