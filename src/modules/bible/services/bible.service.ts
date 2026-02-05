import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infrastructure/cache';

@Injectable()
export class BibleService {
  private readonly logger = new Logger(BibleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getBooks(tenantId: string) {
    const cacheKey = this.cacheService.getTenantKey(tenantId, 'bible:books');
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Mock data - In production, integrate with Bible API
    const books = [
      { id: 'GEN', name: 'Genesis', testament: 'Old Testament', chapters: 50 },
      { id: 'EXO', name: 'Exodus', testament: 'Old Testament', chapters: 40 },
      { id: 'MAT', name: 'Matthew', testament: 'New Testament', chapters: 28 },
      { id: 'JHN', name: 'John', testament: 'New Testament', chapters: 21 },
    ];

    await this.cacheService.set(cacheKey, books, 86400); // Cache for 24 hours
    return books;
  }

  async getChapter(tenantId: string, bookId: string, chapter: number) {
    const cacheKey = this.cacheService.getTenantKey(tenantId, `bible:${bookId}:${chapter}`);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Mock data - In production, integrate with Bible API
    const data = {
      book: bookId,
      chapter,
      verses: [
        { number: 1, text: 'In the beginning God created the heaven and the earth.' },
        { number: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep.' },
      ],
    };

    await this.cacheService.set(cacheKey, data, 86400);
    return data;
  }

  async searchVerses(tenantId: string, query: string) {
    // Mock search - In production, integrate with Bible API search
    return {
      query,
      results: [
        {
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world...',
        },
      ],
    };
  }
}
