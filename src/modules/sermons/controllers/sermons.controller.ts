import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SermonsService } from '../services/sermons.service';
import { CreateSermonDto } from '../dtos/create-sermon.dto';
import { UpdateSermonDto } from '../dtos/update-sermon.dto';
import { QuerySermonDto } from '../dtos/query-sermon.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/constants/roles.constants';

@ApiTags('Sermons')
@ApiBearerAuth()
@Controller('sermons')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SermonsController {
  constructor(private readonly sermonsService: SermonsService) {}

  @Post()
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Create a new sermon' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Sermon created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSermonDto,
  ) {
    const sermon = await this.sermonsService.create(tenantId, dto, userId);
    return {
      success: true,
      data: sermon,
    };
  }

  @Get()
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get all sermons with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sermons retrieved successfully' })
  async findAll(@TenantId() tenantId: string, @Query() query: QuerySermonDto) {
    const result = await this.sermonsService.findAll(tenantId, query);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('speakers')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get list of speakers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Speakers retrieved successfully' })
  async getSpeakers(@TenantId() tenantId: string) {
    const speakers = await this.sermonsService.getSpeakers(tenantId);
    return {
      success: true,
      data: speakers,
    };
  }

  @Get('tags')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get list of tags' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tags retrieved successfully' })
  async getTags(@TenantId() tenantId: string) {
    const tags = await this.sermonsService.getTags(tenantId);
    return {
      success: true,
      data: tags,
    };
  }

  @Get(':id')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get sermon by ID' })
  @ApiParam({ name: 'id', description: 'Sermon ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sermon retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sermon not found' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const sermon = await this.sermonsService.findById(tenantId, id);
    // Increment view count
    await this.sermonsService.incrementViewCount(tenantId, id);
    return {
      success: true,
      data: sermon,
    };
  }

  @Put(':id')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Update a sermon' })
  @ApiParam({ name: 'id', description: 'Sermon ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sermon updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sermon not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSermonDto,
  ) {
    const sermon = await this.sermonsService.update(tenantId, id, dto);
    return {
      success: true,
      data: sermon,
    };
  }

  @Patch(':id/publish')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Publish a sermon' })
  @ApiParam({ name: 'id', description: 'Sermon ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sermon published successfully' })
  async publish(@TenantId() tenantId: string, @Param('id') id: string) {
    const sermon = await this.sermonsService.publish(tenantId, id);
    return {
      success: true,
      data: sermon,
    };
  }

  @Delete(':id')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Delete a sermon' })
  @ApiParam({ name: 'id', description: 'Sermon ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sermon deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sermon not found' })
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.sermonsService.delete(tenantId, id);
    return {
      success: true,
      data: { message: 'Sermon deleted successfully' },
    };
  }
}
