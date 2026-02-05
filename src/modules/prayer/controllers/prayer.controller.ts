import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PrayerService } from '../services/prayer.service';
import { CreatePrayerDto } from '../dtos/create-prayer.dto';
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser, TenantId } from '@common/decorators';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Prayer')
@Controller('prayer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a prayer request' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createPrayerDto: CreatePrayerDto,
  ) {
    return this.prayerService.create(tenantId, userId, createPrayerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prayer requests' })
  async findAll(@TenantId() tenantId: string, @Query() paginationDto: PaginationDto) {
    return this.prayerService.findAll(tenantId, paginationDto.page, paginationDto.limit);
  }

  @Get('my-prayers')
  @ApiOperation({ summary: 'Get my prayer requests' })
  async getMyPrayers(@CurrentUser('userId') userId: string) {
    return this.prayerService.getMyPrayers(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prayer request by ID' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.prayerService.findOne(id);
  }

  @Post(':id/pray')
  @ApiOperation({ summary: 'Pray for a request' })
  async prayFor(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.prayerService.prayForRequest(id, userId);
  }

  @Put(':id/answered')
  @ApiOperation({ summary: 'Mark prayer as answered' })
  async markAsAnswered(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.prayerService.markAsAnswered(id, userId);
  }
}
