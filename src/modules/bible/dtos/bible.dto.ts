import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Query DTOs ─────────────────────────────────────────────────────────────

export class GetChapterDto {
  @ApiPropertyOptional({ description: 'Bible translation ID', default: 'de4e12af7f28f599-02' })
  @IsString()
  @IsOptional()
  translationId?: string;
}

export class SearchVersesDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Bible translation ID', default: 'de4e12af7f28f599-02' })
  @IsString()
  @IsOptional()
  translationId?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results', default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────

export class BibleTranslationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  abbreviation: string;

  @ApiPropertyOptional()
  abbreviationLocal?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  nameLocal?: string;

  @ApiPropertyOptional()
  language?: {
    name: string;
    direction: string;
  };
}

export class BibleBookDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  nameLocal?: string;

  @ApiPropertyOptional()
  abbreviation?: string;

  @ApiProperty()
  testament: string;

  @ApiProperty()
  chapters: number;

  @ApiPropertyOptional()
  order?: number;
}

export class BibleVerseDto {
  @ApiProperty()
  verseId: string;

  @ApiProperty()
  verseStart: number;

  @ApiProperty()
  verseEnd: number;

  @ApiProperty()
  text: string;
}

export class BibleChapterDataDto {
  @ApiProperty()
  translationId: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  chapter: number;

  @ApiProperty({ type: [BibleVerseDto] })
  verses: BibleVerseDto[];
}

export class BibleSearchResultDto {
  @ApiProperty()
  translationId: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  bookName: string;

  @ApiProperty()
  chapter: number;

  @ApiProperty()
  verse: number;

  @ApiProperty()
  text: string;
}

// ─── Internal API.Bible response types ──────────────────────────────────────

export interface ApiBibleResponse<T> {
  data: T;
}

export interface ApiBible {
  id: string;
  name: string;
  abbreviation: string;
  abbreviationLocal?: string;
  description?: string;
  nameLocal?: string;
  language?: { name: string; direction: string };
}

export interface ApiBibleBook {
  id: string;
  name: string;
  nameLocal?: string;
  abbreviation?: string;
  abbreviationLocal?: string;
  chapters?: { id: string; number: string }[];
}

export interface ApiChapterContent {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  content: string;
  reference: string;
}

export interface ApiVerse {
  id: string;
  bookId: string;
  chapterId: string;
  verseStart?: number;
  verseEnd?: number;
  reference?: string;
  text?: string;
}

export interface ApiSearchResult {
  query: string;
  limit: number;
  offset: number;
  total: number;
  verses?: ApiVerse[];
}
