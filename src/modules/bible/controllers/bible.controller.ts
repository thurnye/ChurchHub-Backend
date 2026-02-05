import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { BibleService } from '../services/bible.service';
import { JwtAuthGuard } from '@common/guards';
import { TenantId } from '@common/decorators';

@ApiTags('Bible')
@Controller('bible')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('books')
  @ApiOperation({ summary: 'Get all Bible books' })
  async getBooks(@TenantId() tenantId: string) {
    return this.bibleService.getBooks(tenantId);
  }

  @Get(':bookId/:chapter')
  @ApiOperation({ summary: 'Get Bible chapter' })
  async getChapter(
    @TenantId() tenantId: string,
    @Param('bookId') bookId: string,
    @Param('chapter') chapter: number,
  ) {
    return this.bibleService.getChapter(tenantId, bookId, chapter);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Bible verses' })
  async searchVerses(@TenantId() tenantId: string, @Query('q') query: string) {
    return this.bibleService.searchVerses(tenantId, query);
  }
}
