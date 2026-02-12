import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infrastructure/cache';
import {
  BibleTranslationDto,
  BibleBookDto,
  BibleChapterDataDto,
  BibleVerseDto,
  BibleSearchResultDto,
  ApiBibleResponse,
  ApiChapterContent,
  ApiSearchResult,
} from '../dtos/bible.dto';
import {
  BibleTranslation,
  BibleTranslationDocument,
} from '../entities/bible-translation.entity';
import { BibleBook, BibleBookDocument } from '../entities/bible-book.entity';

// Default Bible translation abbreviation
const DEFAULT_TRANSLATION = 'kjv';

// Cache TTL constants
const CACHE_TTL_CHAPTER = 86400; // 24 hours
const CACHE_TTL_SEARCH = 3600; // 1 hour

@Injectable()
export class BibleService {
  private readonly logger = new Logger(BibleService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    @InjectModel(BibleTranslation.name)
    private readonly translationModel: Model<BibleTranslationDocument>,
    @InjectModel(BibleBook.name)
    private readonly bookModel: Model<BibleBookDocument>,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.apiKey = this.configService.get<string>('BIBLE_API_KEY', '');
    this.apiUrl = this.configService.get<string>(
      'BIBLE_API_URL',
      'https://rest.api.bible/v1',
    );

    this.logger.log(`Bible API URL: ${this.apiUrl}`);
    this.logger.log(`Bible API Key configured: ${this.apiKey ? 'Yes (' + this.apiKey.substring(0, 5) + '...)' : 'No'}`);

    if (!this.apiKey) {
      this.logger.warn('BIBLE_API_KEY is not configured');
    }
  }

  // ─── Fallback Maps (for when database is not seeded) ───────────────────────

  private readonly KNOWN_TRANSLATIONS: Record<string, string> = {
    'kjv': 'de4e12af7f28f599-02',
    'asv': '06125adad2d5898a-01',
    'web': '9879dbb7cfe39e4d-04',
  };

  private readonly KNOWN_BOOKS: Record<string, { bookId: string; name: string; testament: string; chapters: number }> = {
    'gen': { bookId: 'GEN', name: 'Genesis', testament: 'Old Testament', chapters: 50 },
    'genesis': { bookId: 'GEN', name: 'Genesis', testament: 'Old Testament', chapters: 50 },
    'exo': { bookId: 'EXO', name: 'Exodus', testament: 'Old Testament', chapters: 40 },
    'exodus': { bookId: 'EXO', name: 'Exodus', testament: 'Old Testament', chapters: 40 },
    'mat': { bookId: 'MAT', name: 'Matthew', testament: 'New Testament', chapters: 28 },
    'matthew': { bookId: 'MAT', name: 'Matthew', testament: 'New Testament', chapters: 28 },
    'mrk': { bookId: 'MRK', name: 'Mark', testament: 'New Testament', chapters: 16 },
    'mark': { bookId: 'MRK', name: 'Mark', testament: 'New Testament', chapters: 16 },
    'luk': { bookId: 'LUK', name: 'Luke', testament: 'New Testament', chapters: 24 },
    'luke': { bookId: 'LUK', name: 'Luke', testament: 'New Testament', chapters: 24 },
    'jhn': { bookId: 'JHN', name: 'John', testament: 'New Testament', chapters: 21 },
    'john': { bookId: 'JHN', name: 'John', testament: 'New Testament', chapters: 21 },
    'act': { bookId: 'ACT', name: 'Acts', testament: 'New Testament', chapters: 28 },
    'acts': { bookId: 'ACT', name: 'Acts', testament: 'New Testament', chapters: 28 },
    'rom': { bookId: 'ROM', name: 'Romans', testament: 'New Testament', chapters: 16 },
    'romans': { bookId: 'ROM', name: 'Romans', testament: 'New Testament', chapters: 16 },
    'psa': { bookId: 'PSA', name: 'Psalms', testament: 'Old Testament', chapters: 150 },
    'psalms': { bookId: 'PSA', name: 'Psalms', testament: 'Old Testament', chapters: 150 },
    'pro': { bookId: 'PRO', name: 'Proverbs', testament: 'Old Testament', chapters: 31 },
    'proverbs': { bookId: 'PRO', name: 'Proverbs', testament: 'Old Testament', chapters: 31 },
    'rev': { bookId: 'REV', name: 'Revelation', testament: 'New Testament', chapters: 22 },
    'revelation': { bookId: 'REV', name: 'Revelation', testament: 'New Testament', chapters: 22 },
  };

  // ─── Resolvers ─────────────────────────────────────────────────────────────

  /**
   * Resolve translation abbreviation/name to external API ID
   * Accepts: 'kjv', 'KJV', 'King James Version', or the actual external ID
   */
  async resolveTranslationId(translation: string = DEFAULT_TRANSLATION): Promise<string> {
    const query = translation.toLowerCase().trim();

    // Check if it's already a valid external ID (contains hyphen like 'de4e12af7f28f599-02')
    if (query.includes('-') && query.length > 20) {
      return translation;
    }

    // Check hardcoded fallback first (works even without database)
    if (this.KNOWN_TRANSLATIONS[query]) {
      this.logger.debug(`Using known translation for "${query}": ${this.KNOWN_TRANSLATIONS[query]}`);
      return this.KNOWN_TRANSLATIONS[query];
    }

    // Search by abbreviation (case-insensitive)
    const byAbbreviation = await this.translationModel.findOne({
      $or: [
        { abbreviation: { $regex: new RegExp(`^${query}$`, 'i') } },
        { abbreviationLocal: { $regex: new RegExp(`^${query}$`, 'i') } },
      ],
    }).lean();

    if (byAbbreviation) {
      return byAbbreviation.externalId;
    }

    // Search by name (case-insensitive, partial match)
    const byName = await this.translationModel.findOne({
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { nameLocal: { $regex: new RegExp(query, 'i') } },
      ],
    }).lean();

    if (byName) {
      return byName.externalId;
    }

    this.logger.warn(`Translation "${translation}" not found, using as-is`);
    return translation;
  }

  /**
   * Resolve book name/abbreviation to full book data
   * Accepts: 'john', 'John', 'JHN', 'Genesis', 'gen', etc.
   * Returns the full book data or null if not found
   */
  async resolveBook(book: string): Promise<BibleBook | null> {
    const query = book.toLowerCase().trim();

    // Check hardcoded fallback first (works even without database)
    if (this.KNOWN_BOOKS[query]) {
      const known = this.KNOWN_BOOKS[query];
      this.logger.debug(`Using known book for "${query}": ${known.bookId}`);
      return known as BibleBook;
    }

    // Also check if the input IS a book ID directly (e.g., 'JHN', 'GEN')
    const upperQuery = book.toUpperCase().trim();
    const knownByBookId = Object.values(this.KNOWN_BOOKS).find(b => b.bookId === upperQuery);
    if (knownByBookId) {
      this.logger.debug(`Using known book by ID "${upperQuery}": ${knownByBookId.name}`);
      return knownByBookId as BibleBook;
    }

    // Search by book ID (case-insensitive)
    const byBookId = await this.bookModel.findOne({
      bookId: { $regex: new RegExp(`^${query}$`, 'i') },
    }).lean();

    if (byBookId) {
      return byBookId;
    }

    // Search by name (case-insensitive, partial match from start)
    const byName = await this.bookModel.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${query}`, 'i') } },
        { nameLocal: { $regex: new RegExp(`^${query}`, 'i') } },
        { abbreviation: { $regex: new RegExp(`^${query}$`, 'i') } },
      ],
    }).lean();

    if (byName) {
      return byName;
    }

    this.logger.warn(`Book "${book}" not found`);
    return null;
  }
  
  // ─── HTTP Helper ────────────────────────────────────────────────────────────
  
  private async apiFetch<T>(path: string): Promise<T> {
    const url = `${this.apiUrl}${path}`;

    this.logger.debug(`Fetching: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'api-key': this.apiKey,
        },
      });

      if (response.status === 401 || response.status === 403) {
        const errorBody = await response.text();
        this.logger.error(`Bible API auth error: ${response.status} - ${errorBody}`);
        throw new HttpException(
          'Bible API key is invalid or missing permissions',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (response.status === 429) {
        throw new HttpException(
          'Rate limit reached. Please try again shortly.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (response.status === 404) {
        return { data: null } as T;
      }

      if (!response.ok) {
        throw new HttpException(
          `Bible API error: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Bible API fetch error: ${error.message}`);
      throw new HttpException(
        'Unable to connect to Bible API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ─── Translations ───────────────────────────────────────────────────────────

  async getTranslations(): Promise<BibleTranslationDto[]> {
    // Read from database (seeded data)
    const translations = await this.translationModel.find().lean();

    if (translations.length === 0) {
      this.logger.warn(
        'No translations found in database. Run "npm run seed:bible" to populate.',
      );
      return [];
    }

    return translations.map((t) => ({
      id: t.externalId,
      name: t.name,
      abbreviation: t.abbreviation,
      abbreviationLocal: t.abbreviationLocal,
      description: t.description,
      nameLocal: t.nameLocal,
      language: t.languageInfo,
    }));
  }

  // ─── Books ──────────────────────────────────────────────────────────────────

  async getBooks(): Promise<BibleBookDto[]> {
    // Read from database (seeded data)
    const books = await this.bookModel
      .find()
      .sort({ order: 1 })
      .lean();

    if (books.length === 0) {
      this.logger.warn(
        'No books found in database. Run "npm run seed:bible" to populate.',
      );
      return [];
    }

    return books.map((b) => ({
      id: b.bookId,
      name: b.name,
      nameLocal: b.nameLocal,
      abbreviation: b.abbreviation,
      testament: b.testament,
      chapters: b.chapters,
      order: b.order,
    }));
  }

  // ─── Chapter ────────────────────────────────────────────────────────────────

  async getChapter(
    book: string,
    chapter: number,
    translation: string = DEFAULT_TRANSLATION,
  ): Promise<BibleChapterDataDto> {
    // Resolve translation and book
    const translationId = await this.resolveTranslationId(translation);
    const bookData = await this.resolveBook(book);

    if (!bookData) {
      throw new HttpException(`Book "${book}" not found`, HttpStatus.NOT_FOUND);
    }

    const bookId = bookData.bookId;

    const cacheKey = `bible:chapter:${translationId}:${bookId}:${chapter}`;
    const cached = await this.cacheService.get<BibleChapterDataDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const chapterId = `${bookId}.${chapter}`;
    this.logger.debug(`Fetching chapter: ${chapterId} for translation: ${translationId}`);

    const response = await this.apiFetch<ApiBibleResponse<ApiChapterContent>>(
      `/bibles/${translationId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`,
    );

    this.logger.debug(`API response data keys: ${response.data ? Object.keys(response.data).join(', ') : 'null'}`);
    this.logger.debug(`Content length: ${response.data?.content?.length ?? 0}`);

    if (!response.data?.content) {
      this.logger.error(`No content in response for ${chapterId}`);
      throw new HttpException('Chapter not found', HttpStatus.NOT_FOUND);
    }

    // Log first 500 chars of content for debugging
    this.logger.debug(`Content preview: ${response.data.content.substring(0, 500)}`);

    const verses = this.parseChapterContent(
      response.data.content,
      bookId,
      chapter,
    );

    this.logger.debug(`Parsed ${verses.length} verses from content`);

    const chapterData: BibleChapterDataDto = {
      translationId,
      bookId,
      chapter,
      verses,
    };

    await this.cacheService.set(cacheKey, chapterData, CACHE_TTL_CHAPTER);
    return chapterData;
  }

  private parseChapterContent(
    content: string,
    bookId: string,
    chapter: number,
  ): BibleVerseDto[] {
    const verses: BibleVerseDto[] = [];

    // Pattern 1: data-number attribute (most common)
    // <span class="v" data-number="1">1</span>text...
    const pattern1 =
      /<span[^>]*data-number="(\d+)"[^>]*>[^<]*<\/span>([\s\S]*?)(?=<span[^>]*data-number="|$)/g;

    let match;
    while ((match = pattern1.exec(content)) !== null) {
      const verseNum = Number(match[1]);
      const text = match[2]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (text) {
        verses.push({
          verseId: `${bookId}.${chapter}.${verseNum}`,
          verseStart: verseNum,
          verseEnd: verseNum,
          text,
        });
      }
    }

    // Pattern 2: class="v" without data-number
    if (verses.length === 0) {
      this.logger.debug('Pattern 1 failed, trying pattern 2...');
      const pattern2 =
        /<span[^>]*class="v"[^>]*>(\d+)<\/span>([\s\S]*?)(?=<span[^>]*class="v"|$)/g;

      while ((match = pattern2.exec(content)) !== null) {
        const verseNum = Number(match[1]);
        const text = match[2]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (text) {
          verses.push({
            verseId: `${bookId}.${chapter}.${verseNum}`,
            verseStart: verseNum,
            verseEnd: verseNum,
            text,
          });
        }
      }
    }

    // Pattern 3: data-vid attribute (some translations use this)
    // <span data-vid="GEN.1.1">...</span>
    if (verses.length === 0) {
      this.logger.debug('Pattern 2 failed, trying pattern 3 (data-vid)...');
      const pattern3 =
        /<span[^>]*data-vid="[^"]+\.(\d+)"[^>]*>([\s\S]*?)<\/span>/g;

      while ((match = pattern3.exec(content)) !== null) {
        const verseNum = Number(match[1]);
        const text = match[2]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (text && verseNum > 0) {
          verses.push({
            verseId: `${bookId}.${chapter}.${verseNum}`,
            verseStart: verseNum,
            verseEnd: verseNum,
            text,
          });
        }
      }
    }

    // Pattern 4: paragraph-based with verse markers
    // Some translations use <sup>1</sup> or similar for verse numbers
    if (verses.length === 0) {
      this.logger.debug('Pattern 3 failed, trying pattern 4 (sup tags)...');
      const pattern4 = /<sup[^>]*>(\d+)<\/sup>([\s\S]*?)(?=<sup[^>]*>\d+<\/sup>|<\/p>|$)/g;

      while ((match = pattern4.exec(content)) !== null) {
        const verseNum = Number(match[1]);
        const text = match[2]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (text) {
          verses.push({
            verseId: `${bookId}.${chapter}.${verseNum}`,
            verseStart: verseNum,
            verseEnd: verseNum,
            text,
          });
        }
      }
    }

    // If still no verses, log a warning with content sample
    if (verses.length === 0) {
      this.logger.warn(`Failed to parse any verses from content. Sample: ${content.substring(0, 300)}`);
    }

    // Sort verses by verse number
    verses.sort((a, b) => a.verseStart - b.verseStart);

    return verses;
  }

  // ─── Search ─────────────────────────────────────────────────────────────────

  async searchVerses(
    query: string,
    translation: string = DEFAULT_TRANSLATION,
    limit: number = 20,
  ): Promise<BibleSearchResultDto[]> {
    if (!query.trim()) {
      return [];
    }

    // Resolve translation abbreviation to external ID
    const translationId = await this.resolveTranslationId(translation);

    const cacheKey = `bible:search:${translationId}:${query}:${limit}`;
    const cached = await this.cacheService.get<BibleSearchResultDto[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const response = await this.apiFetch<ApiBibleResponse<ApiSearchResult>>(
      `/bibles/${translationId}/search?query=${encodedQuery}&limit=${limit}`,
    );

    const results: BibleSearchResultDto[] = (response.data?.verses || []).map((v) => {
      const idParts = v.id.split('.');
      return {
        translationId,
        bookId: idParts[0] || v.bookId || '',
        bookName: v.reference || '',
        chapter: Number(idParts[1]) || 0,
        verse: Number(idParts[2]) || 0,
        text: (v.text ?? '').replace(/<[^>]+>/g, '').trim(),
      };
    });

    await this.cacheService.set(cacheKey, results, CACHE_TTL_SEARCH);
    return results;
  }

  // ─── Single Verse ───────────────────────────────────────────────────────────

  async getVerse(
    book: string,
    chapter: number,
    verse: number,
    translation: string = DEFAULT_TRANSLATION,
  ): Promise<BibleVerseDto | null> {
    // getChapter already handles resolution
    const chapterData = await this.getChapter(book, chapter, translation);
    return chapterData.verses.find((v) => v.verseStart === verse) || null;
  }

  // ─── Verse Range ────────────────────────────────────────────────────────────

  async getVerseRange(
    book: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    translation: string = DEFAULT_TRANSLATION,
  ): Promise<BibleVerseDto[]> {
    // getChapter already handles resolution
    const chapterData = await this.getChapter(book, chapter, translation);
    return chapterData.verses.filter(
      (v) => v.verseStart >= verseStart && v.verseStart <= verseEnd,
    );
  }
}
