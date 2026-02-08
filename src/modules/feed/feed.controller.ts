import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser } from '@common/decorators';
import { PaginationDto } from '@common/dtos';

@ApiTags('Feed')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated feed for user' })
  async getFeed(
    @CurrentUser('tenantId') tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getFeed(tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific feed item by ID' })
  async getFeedItem(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.feedService.getFeedItem(tenantId, id);
  }
}
