export const CACHE_KEYS = {
  BIBLE_TRANSLATIONS: 'bible:translations',
  BIBLE_BOOKS: (translationId: string) => `bible:books:${translationId}`,
  TENANT: (tenantId: string) => `tenant:${tenantId}`,
  USER: (userId: string) => `user:${userId}`,
};

export const CACHE_TTL = {
  BIBLE_TRANSLATIONS: 86400, // 24 hours
  BIBLE_BOOKS: 86400, // 24 hours
  TENANT: 3600, // 1 hour
  USER: 1800, // 30 minutes
};
