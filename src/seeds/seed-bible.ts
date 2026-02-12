import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';

// ─── API.Bible Response Types ────────────────────────────────────────────────

interface ApiBible {
  id: string;
  name: string;
  abbreviation: string;
  abbreviationLocal?: string;
  description?: string;
  nameLocal?: string;
  language?: { name: string; direction: string };
}

interface ApiBibleBook {
  id: string;
  name: string;
  nameLocal?: string;
  abbreviation?: string;
  chapters?: { id: string; number: string }[];
}

interface ApiBibleResponse<T> {
  data: T;
}

// Old Testament book IDs
const OLD_TESTAMENT_BOOKS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
];
const NEW_TESTAMENT_BOOKS = [
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

async function seedBible() {
  const logger = new Logger('BibleSeeder');
  logger.log('Starting Bible data seed...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const apiKey = configService.get<string>('BIBLE_API_KEY', '');
    const apiUrl = configService.get<string>('BIBLE_API_URL', 'https://rest.api.bible/v1');

    if (!apiKey) {
      throw new Error('BIBLE_API_KEY is not configured in .env file');
    }

    // Get models
    const BibleTranslationModel = app.get<Model<any>>(getModelToken('BibleTranslation'));
    const BibleBookModel = app.get<Model<any>>(getModelToken('BibleBook'));

    // ─── Helper function to fetch from API.Bible ─────────────────────────────

    async function apiFetch<T>(path: string): Promise<T> {
      const url = `${apiUrl}${path}`;
      logger.debug(`Fetching: ${url}`);

      const response = await fetch(url, {
        headers: {
          'api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API.Bible error ${response.status}: ${errorBody}`);
      }

      return response.json() as Promise<T>;
    }

    // ─── Fetch and save English translations ─────────────────────────────────

    logger.log('Fetching English Bible translations from API.Bible...');
    const translationsResponse = await apiFetch<ApiBibleResponse<ApiBible[]>>(
      '/bibles?language=eng',
    );

    const translations = translationsResponse.data || [];
    logger.log(`Found ${translations.length} English translations`);

    // Clear existing translations
    await BibleTranslationModel.deleteMany({});
    logger.log('Cleared existing translations');

    // Insert translations
    const translationDocs = translations.map((t) => ({
      externalId: t.id,
      name: t.name,
      abbreviation: t.abbreviation,
      abbreviationLocal: t.abbreviationLocal,
      description: t.description,
      nameLocal: t.nameLocal,
      languageInfo: t.language,
    }));

    await BibleTranslationModel.insertMany(translationDocs);
    logger.log(`Inserted ${translationDocs.length} translations`);

    // ─── Fetch and save books for KJV (default translation) ─────────────────

    // Find KJV translation
    const kjvTranslation = translations.find(
      (t) =>
        t.abbreviation.toLowerCase() === 'kjv' ||
        t.abbreviationLocal?.toLowerCase() === 'kjv',
    );

    if (!kjvTranslation) {
      logger.warn('KJV translation not found, using first available translation');
    }

    const defaultTranslationId = kjvTranslation?.id || translations[0]?.id;

    if (!defaultTranslationId) {
      throw new Error('No translations available to fetch books from');
    }

    logger.log(`Fetching books for translation: ${defaultTranslationId}`);
    const booksResponse = await apiFetch<ApiBibleResponse<ApiBibleBook[]>>(
      `/bibles/${defaultTranslationId}/books?include-chapters=true`,
    );

    const books = booksResponse.data || [];
    logger.log(`Found ${books.length} books`);

    // Clear existing books
    await BibleBookModel.deleteMany({});
    logger.log('Cleared existing books');

    // Insert books
    const bookDocs = books.map((b, index) => ({
      bookId: b.id,
      name: b.name,
      nameLocal: b.nameLocal,
      abbreviation: b.abbreviation,
      testament: OLD_TESTAMENT_BOOKS.includes(b.id) ? 'Old Testament' : NEW_TESTAMENT_BOOKS.includes(b.id) ? 'New Testament' : 'Apocrypha / Deuterocanonical Books',
      chapters: b.chapters?.length || 0,
      order: index + 1,
    }));

    await BibleBookModel.insertMany(bookDocs);
    logger.log(`Inserted ${bookDocs.length} books`);

    // ─── Summary ─────────────────────────────────────────────────────────────

    const translationCount = await BibleTranslationModel.countDocuments();
    const bookCount = await BibleBookModel.countDocuments();

    logger.log('='.repeat(60));
    logger.log('BIBLE SEED COMPLETED SUCCESSFULLY!');
    logger.log('='.repeat(60));
    logger.log('');
    logger.log('Created:');
    logger.log(`  - ${translationCount} Bible Translations (English)`);
    logger.log(`  - ${bookCount} Bible Books`);
    logger.log('');
    logger.log(`Default Translation ID: ${defaultTranslationId}`);
    logger.log('');
    logger.log('Sample translations:');
    const sampleTranslations = await BibleTranslationModel.find().limit(5);
    for (const t of sampleTranslations) {
      logger.log(`  - ${t.name} (${t.abbreviation}) - ID: ${t.externalId}`);
    }
    logger.log('='.repeat(60));

  } catch (error) {
    logger.error('Bible seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedBible()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Bible seed error:', error);
    process.exit(1);
  });
