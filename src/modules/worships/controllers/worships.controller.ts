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
import { WorshipsService } from '../services/worships.service';
import { CreateWorshipResourceDto } from '../dtos/create-worship-resource.dto';
import { UpdateWorshipResourceDto } from '../dtos/update-worship-resource.dto';
import { CreateWorshipSetDto } from '../dtos/create-worship-set.dto';
import { UpdateWorshipSetDto } from '../dtos/update-worship-set.dto';
import { QueryWorshipResourceDto, QueryWorshipSetDto } from '../dtos/query-worship.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/constants/roles.constants';

@ApiTags('Worships')
@ApiBearerAuth()
@Controller('worships')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class WorshipsController {
  constructor(private readonly worshipsService: WorshipsService) {}

  // ========== RESOURCES ==========

  @Post('resources')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY, Role.LEADER)
  @ApiOperation({ summary: 'Create a worship resource' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Resource created' })
  async createResource(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorshipResourceDto,
  ) {
    const resource = await this.worshipsService.createResource(tenantId, dto, userId);
    return {
      success: true,
      data: resource,
    };
  }

  @Get('resources')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get all worship resources' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resources retrieved' })
  async findAllResources(
    @TenantId() tenantId: string,
    @Query() query: QueryWorshipResourceDto,
  ) {
    const result = await this.worshipsService.findAllResources(tenantId, query);
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

  @Get('resources/tags')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get list of resource tags' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tags retrieved' })
  async getResourceTags(@TenantId() tenantId: string) {
    const tags = await this.worshipsService.getResourceTags(tenantId);
    return {
      success: true,
      data: tags,
    };
  }

  @Get('resources/keys')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get list of song keys' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Keys retrieved' })
  async getResourceKeys(@TenantId() tenantId: string) {
    const keys = await this.worshipsService.getResourceKeys(tenantId);
    return {
      success: true,
      data: keys,
    };
  }

  @Get('resources/:id')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get worship resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource retrieved' })
  async findResourceById(@TenantId() tenantId: string, @Param('id') id: string) {
    const resource = await this.worshipsService.findResourceById(tenantId, id);
    return {
      success: true,
      data: resource,
    };
  }

  @Put('resources/:id')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY, Role.LEADER)
  @ApiOperation({ summary: 'Update a worship resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource updated' })
  async updateResource(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorshipResourceDto,
  ) {
    const resource = await this.worshipsService.updateResource(tenantId, id, dto);
    return {
      success: true,
      data: resource,
    };
  }

  @Patch('resources/:id/archive')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Archive a worship resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource archived' })
  async archiveResource(@TenantId() tenantId: string, @Param('id') id: string) {
    const resource = await this.worshipsService.archiveResource(tenantId, id);
    return {
      success: true,
      data: resource,
    };
  }

  @Delete('resources/:id')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Delete a worship resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource deleted' })
  async deleteResource(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.worshipsService.deleteResource(tenantId, id);
    return {
      success: true,
      data: { message: 'Worship resource deleted successfully' },
    };
  }

  // ========== SETS ==========

  @Post('sets')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY, Role.LEADER)
  @ApiOperation({ summary: 'Create a worship set' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Set created' })
  async createSet(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorshipSetDto,
  ) {
    const set = await this.worshipsService.createSet(tenantId, dto, userId);
    return {
      success: true,
      data: set,
    };
  }

  @Get('sets')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get all worship sets' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sets retrieved' })
  async findAllSets(@TenantId() tenantId: string, @Query() query: QueryWorshipSetDto) {
    const result = await this.worshipsService.findAllSets(tenantId, query);
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

  @Get('sets/upcoming')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get upcoming worship sets' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Upcoming sets retrieved' })
  async getUpcomingSets(@TenantId() tenantId: string) {
    const sets = await this.worshipsService.getUpcomingSets(tenantId);
    return {
      success: true,
      data: sets,
    };
  }

  @Get('sets/:id')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get worship set by ID' })
  @ApiParam({ name: 'id', description: 'Set ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Set retrieved' })
  async findSetById(@TenantId() tenantId: string, @Param('id') id: string) {
    const set = await this.worshipsService.findSetById(tenantId, id);
    return {
      success: true,
      data: set,
    };
  }

  @Put('sets/:id')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY, Role.LEADER)
  @ApiOperation({ summary: 'Update a worship set' })
  @ApiParam({ name: 'id', description: 'Set ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Set updated' })
  async updateSet(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorshipSetDto,
  ) {
    const set = await this.worshipsService.updateSet(tenantId, id, dto);
    return {
      success: true,
      data: set,
    };
  }

  @Patch('sets/:id/publish')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Publish a worship set' })
  @ApiParam({ name: 'id', description: 'Set ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Set published' })
  async publishSet(@TenantId() tenantId: string, @Param('id') id: string) {
    const set = await this.worshipsService.publishSet(tenantId, id);
    return {
      success: true,
      data: set,
    };
  }

  @Delete('sets/:id')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Delete a worship set' })
  @ApiParam({ name: 'id', description: 'Set ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Set deleted' })
  async deleteSet(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.worshipsService.deleteSet(tenantId, id);
    return {
      success: true,
      data: { message: 'Worship set deleted successfully' },
    };
  }
}
