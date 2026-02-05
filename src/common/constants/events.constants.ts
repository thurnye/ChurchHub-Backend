export enum EventName {
  COMMUNITY_POST_CREATED = 'community.post.created',
  EVENT_CREATED = 'event.created',
  PRAYER_REQUEST_CREATED = 'prayer.request.created',
  SERMON_PUBLISHED = 'sermon.published',
  WORSHIP_SET_SCHEDULED = 'worship.set.scheduled',
  MEMBER_JOINED_TENANT = 'member.joined.tenant',
  DONATION_STATUS_UPDATED = 'donation.status.updated',
}

// Alias for backwards compatibility
export const EventNames = EventName;

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  CLEANUP: 'cleanup',
};
