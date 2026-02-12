import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BibleService } from '../services/bible.service';
import { JwtAuthGuard } from '@common/guards';
import {
  BibleTranslationDto,
  BibleBookDto,
  BibleChapterDataDto,
  BibleSearchResultDto,
} from '../dtos/bible.dto';

@ApiTags('Bible')
@Controller('bible')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('translations')
  @ApiOperation({ summary: 'Get available Bible translations (English)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of available Bible translations',
    type: [BibleTranslationDto],
  })
  async getTranslations() {
    return this.bibleService.getTranslations();
  }

  @Get('books')
  @ApiOperation({ summary: 'Get all Bible books' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Bible books',
    type: [BibleBookDto],
  })
  async getBooks() {
    return this.bibleService.getBooks();
  }

  @Get('chapters/:book/:chapter')
  @ApiOperation({ summary: 'Get Bible chapter with verses' })
  @ApiParam({ name: 'book', description: 'Book name or ID (e.g., john, genesis, GEN, JHN)' })
  @ApiParam({ name: 'chapter', description: 'Chapter number' })
  @ApiQuery({
    name: 'translationId',
    required: false,
    description: 'Bible translation (e.g., kjv, niv, esv) - defaults to KJV',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chapter data with verses',
    type: BibleChapterDataDto,
  })
  async getChapter(
    @Param('book') book: string,
    @Param('chapter', ParseIntPipe) chapter: number,
    @Query('translationId') translationId?: string,
  ) {
    return this.bibleService.getChapter(book, chapter, translationId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Bible verses' })
  @ApiQuery({ name: 'query', description: 'Search query', required: true })
  @ApiQuery({
    name: 'translationId',
    required: false,
    description: 'Bible translation ID (defaults to KJV)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results (default: 20)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: [BibleSearchResultDto],
  })
  async searchVerses(
    @Query('query') query: string,
    @Query('translationId') translationId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.bibleService.searchVerses(
      query,
      translationId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('verses/:book/:chapter/:verse')
  @ApiOperation({ summary: 'Get a single Bible verse' })
  @ApiParam({ name: 'book', description: 'Book name or ID (e.g., john, genesis, GEN, JHN)' })
  @ApiParam({ name: 'chapter', description: 'Chapter number' })
  @ApiParam({ name: 'verse', description: 'Verse number' })
  @ApiQuery({
    name: 'translationId',
    required: false,
    description: 'Bible translation (e.g., kjv, niv, esv) - defaults to KJV',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Single verse data',
  })
  async getVerse(
    @Param('book') book: string,
    @Param('chapter', ParseIntPipe) chapter: number,
    @Param('verse', ParseIntPipe) verse: number,
    @Query('translationId') translationId?: string,
  ) {
    return this.bibleService.getVerse(book, chapter, verse, translationId);
  }

  @Get('verses/:book/:chapter/:verseStart/:verseEnd')
  @ApiOperation({ summary: 'Get a range of Bible verses' })
  @ApiParam({ name: 'book', description: 'Book name or ID (e.g., john, genesis, GEN, JHN)' })
  @ApiParam({ name: 'chapter', description: 'Chapter number' })
  @ApiParam({ name: 'verseStart', description: 'Starting verse number' })
  @ApiParam({ name: 'verseEnd', description: 'Ending verse number' })
  @ApiQuery({
    name: 'translationId',
    required: false,
    description: 'Bible translation (e.g., kjv, niv, esv) - defaults to KJV',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verse range data',
  })
  async getVerseRange(
    @Param('book') book: string,
    @Param('chapter', ParseIntPipe) chapter: number,
    @Param('verseStart', ParseIntPipe) verseStart: number,
    @Param('verseEnd', ParseIntPipe) verseEnd: number,
    @Query('translationId') translationId?: string,
  ) {
    return this.bibleService.getVerseRange(
      book,
      chapter,
      verseStart,
      verseEnd,
      translationId,
    );
  }
}
